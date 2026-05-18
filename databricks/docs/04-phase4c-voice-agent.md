# Phase 4c — Voice Agent on the same Render service

Status: **code pushed; awaiting DEEPGRAM_API_KEY env var on Render**
Branch: `databricks-migration`
Date opened: 2026-05-18

---

## Why this phase exists

The portfolio had two backend services living in parallel:

1. **`analytics-backend/functions/main.py`** — the dashboard API (Phase 4b: now Databricks-backed).
2. **`voice-agent/server.py`** — a separate Deepgram Voice Agent WebSocket proxy on port 8100 for local dev. Production never had a hosted version — the frontend's `useVoiceAgent` hook just hit `wss://{window.location.host}/agent`, which only worked when the dev was running both servers locally.

This phase **collapses both into one Render service**. The Render-hosted FastAPI now serves:

- `GET  /api/dashboard3`  — analytics (Databricks-backed)
- `GET  /api/sync-status` — legacy stub
- `GET  /health`           — pinged by the keep-warm GitHub Action
- `GET  /`                  — service info
- **`WS   /agent`           — voice agent (NEW)**

The frontend's URL logic (`wss://{window.location.host}/agent`) now resolves to the live Render service for production visitors.

---

## What changed in code

| File | Change |
|---|---|
| `analytics-backend/functions/voice_agent.py` | **New.** A clean module form of `voice-agent/server.py`. Strips the standalone FastAPI app / CORS / `/health` / static-file mount / `__main__` block. Keeps the system prompt, `AGENT_FUNCTIONS`, `build_settings()`, `handle_function_call()`, and the bidirectional WebSocket proxy. Exposes `register(app)` which adds `/agent` as a WebSocket route on an existing FastAPI app. |
| `analytics-backend/functions/main.py` | `from voice_agent import register as register_voice_agent`. After CORS middleware, call `register_voice_agent(app)`. |
| `analytics-backend/functions/requirements.txt` | Added `websockets==13.*`. Bumped `fastapi` 0.109 → 0.115 and `uvicorn` 0.27 → 0.30 to match what the voice-agent has been tested with. |
| `voice-agent/server.py` | **Left untouched** — still works as a standalone local-dev option on port 8100. Both files now contain equivalent logic; whichever you run, the `/agent` route behaves the same. (See "Open items" below for de-duplication.) |

---

## Decisions

### 1. One Render service, not two
- Keeps you within the 750 service-hour/month free tier.
- One keep-warm ping (`/health`) covers both.
- One env-var set to manage.
- Same TLS termination — frontend doesn't need to know two URLs.

### 2. Module + `register(app)` pattern, not bulk-copy into `main.py`
- `main.py` stays focused on analytics (~700 lines). 
- Voice-agent code (~500 lines including the 150-line system prompt) lives in its own file.
- Pattern: `app.add_websocket_route("/agent", _agent_websocket)` — idiomatic FastAPI.

### 3. Frontend untouched
- `src/components/VoiceAgent.tsx` already resolves the WebSocket URL via
  `wss://${window.location.host}/agent`. In production this is now the Render hostname; in local dev with a Vite proxy or local Render-clone it points wherever.
- No frontend env-var changes needed.

### 4. `voice-agent/` folder left in place
- Still useful for local-only dev where you want to run JUST the voice agent (`uvicorn server:app --port 8100`).
- It's not yet committed to git anyway (`voice-agent/` is in the untracked `?? voice-agent/` state).

### 5. No new system prompt / function changes
- Verbatim port. Aria's behavior is identical to what voice-agent/server.py produced.
- 10 agent functions: `navigate_to_section`, `navigate_to_project`, `navigate_to_client`, `navigate_to_dashboard`, `go_back`, `scroll_page`, `open_external_link`, `submit_contact_form`, `toggle_theme`, `filter_projects`.

---

## Local smoke test (2026-05-18)

Combined service running on port 8087 against the live Databricks workspace:

| Endpoint | Result |
|---|---|
| `GET /health` | 200 in <100ms, `database: databricks_sql_warehouse (not pinged from /health)` ✅ |
| `GET /api/dashboard3?start_date=2026-05-10&end_date=2026-05-16` | 200 in 53s (cold warehouse), `source: databricks`, `overview.totalSessions: 47` ✅ |
| `WS  /agent` | Connected, received `{"type":"Welcome","request_id":"..."}` from Deepgram via proxy ✅ |

Server log on the WebSocket:
```
INFO: ('127.0.0.1', 37922) - "WebSocket /agent" [accepted]
INFO: connection open
```

---

## ⚠ Manual step required before this works on Render

Add **`DEEPGRAM_API_KEY`** to Render env vars:

1. https://dashboard.render.com → **portfolio-analytics-api** → **Environment**.
2. Add: `DEEPGRAM_API_KEY = <your Deepgram API key — the value already in voice-agent/.env locally>`
3. Save → Render auto-redeploys (~3 min).
4. Once live, the WebSocket at `wss://portfolio-analytics-api.onrender.com/agent` will work.
5. Open https://abhinavbuilds.in → click the Aria voice widget → confirm she greets you.

---

## DE / Architecture principles applied

| Principle | How it shows up |
|---|---|
| Service consolidation | One Render service, not two |
| Module decomposition | `voice_agent.py` is a clean module with a `register(app)` function |
| Schema fidelity | Frontend unchanged; same `/agent` path; same agent behavior |
| Secrets management | DEEPGRAM_API_KEY in Render env vars only; never in repo |
| Cost discipline | Stays within the 750-hour free tier (single service, single warm-keeper) |

---

## Open items / deferred

- **De-duplicate** `voice-agent/server.py` vs `analytics-backend/functions/voice_agent.py`. They contain the same system prompt + functions. Two options:
  - Delete `voice-agent/` entirely; run analytics-backend's `main.py` locally for dev.
  - Have `voice-agent/server.py` import from `analytics-backend/functions/voice_agent.py` via a sys.path tweak.
  Defer until the next code change in the agent reveals the friction.
- **WebSocket scaling** — Render free tier is single-instance, so one Voice Agent session per tenant works. If multiple visitors concurrently hit `/agent`, each gets its own Deepgram WebSocket. Document if scaling needs change.
- **Conversation logging to Databricks** — currently nothing is persisted from agent sessions. Future Phase 5 candidate: pipe `ConversationText` events into Bronze so we can do retention analysis on what visitors ask.

---

## How to operate

```bash
# Run combined service locally:
cd analytics-backend/functions
DEEPGRAM_API_KEY=... DATABRICKS_SERVER_HOSTNAME=... DATABRICKS_HTTP_PATH=... DATABRICKS_TOKEN=... \
  uvicorn main:app --host 0.0.0.0 --port 8080

# Or run just the voice-agent locally (legacy path, port 8100):
cd voice-agent
DEEPGRAM_API_KEY=... python server.py
```

Production: pushed to `databricks-migration` branch → Render auto-deploys. After adding `DEEPGRAM_API_KEY` env var, the WebSocket `/agent` route goes live.
