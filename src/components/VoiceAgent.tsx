import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import gsap from "gsap";

type AgentState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

const VOICE_AGENT_WS_URL =
  import.meta.env.VITE_VOICE_AGENT_WS_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/agent`
    : "ws://localhost:8100/agent");

const LINKS: Record<string, string> = {
  github: "https://github.com/AbhinavSarkarr",
  linkedin: "https://www.linkedin.com/in/abhinavsarkarrr",
  huggingface: "https://huggingface.co/abhinavsarkar",
  resume: "https://drive.google.com/file/d/1ZyA0fzIfQ_pH0d_CRoXiuUmplwI1Pb_J/view?usp=sharing",
  publication: "https://doi.org/10.1016/j.nlp.2024.100088",
  email: "mailto:abhinavsarkar53@gmail.com",
  cert_databricks: "https://credentials.databricks.com/c8f3e6a5-1234-5678-9abc-def012345678",
  cert_aws: "https://cp.certmetrics.com/amazon/en/public/verify/credential/b14b5afb7bd44dfa9bb5caf44e160813",
  "project_github_autonomous-trading-system": "https://github.com/AbhinavSarkarr/AI-Agents",
  "project_github_llm-from-scratch": "https://github.com/AbhinavSarkarr/LLM-From-Scratch",
  "project_github_texttweakai": "https://github.com/AbhinavSarkarr/TextTweakAI",
  "project_github_virtual-try-on": "https://github.com/AbhinavSarkarr/Virtual-Try-On",
  "project_github_visa-approval-prediction": "https://github.com/AbhinavSarkarr/Visa-Approval-Prediction-using-IBM-Watson-Machine-Learning",
  "project_github_finetuned-llms": "https://github.com/AbhinavSarkarr/Finetuned-LLMs",
  "project_github_telco-churn-prediction": "https://github.com/AbhinavSarkarr/Telco-Customer-Churn-Prediction",
  "project_github_recommender-systems": "https://github.com/AbhinavSarkarr/Recommender-Systems",
  "project_github_delhi-air-quality": "https://github.com/AbhinavSarkarr/Delhi-Air-Quality-Predictor-End-to-End",
  "project_github_model-distillation": "https://github.com/AbhinavSarkarr/Model-Distillagtion-Ticket-Support",
  "project_github_video-membership": "https://github.com/AbhinavSarkarr/Video-Membership-Web-App",
  "project_live_llm-from-scratch": "https://bytepairtokenizer.netlify.app/",
  "project_live_texttweakai": "https://huggingface.co/spaces/abhinavsarkar/TextTweakAI",
  "project_whatsapp_virtual-try-on": "https://wa.me/14155238886?text=join%20along-most",
};

// Portfolio design colors
const PALETTE = {
  neon: "#7B42F6",
  accent: "#00E0FF",
  glow: "#9D41FB",
  highlight: "#FF3DDB",
};

// Color configs per state using portfolio palette
const STATE_COLORS: Record<AgentState, { r1: number; g1: number; b1: number; r2: number; g2: number; b2: number }> = {
  idle: { r1: 123, g1: 66, b1: 246, r2: 157, g2: 65, b2: 251 },       // neon purple / glow
  connecting: { r1: 123, g1: 66, b1: 246, r2: 0, g2: 224, b2: 255 },   // purple -> cyan
  listening: { r1: 0, g1: 224, b1: 255, r2: 16, g2: 185, b2: 150 },    // cyan / teal
  thinking: { r1: 123, g1: 66, b1: 246, r2: 255, g2: 61, b2: 219 },    // purple / pink
  speaking: { r1: 0, g1: 180, b1: 255, r2: 123, g2: 66, b2: 246 },     // blue-cyan / purple
};

// --- Orb Canvas ---
function AgentOrb({ state, size = 100 }: { state: AgentState; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const intensityRef = useRef({ value: 0 });
  const colorsRef = useRef({ ...STATE_COLORS.idle });

  useEffect(() => {
    const intensities: Record<AgentState, number> = {
      idle: 0.2,
      connecting: 0.4,
      listening: 0.55,
      thinking: 0.7,
      speaking: 1.0,
    };
    gsap.to(intensityRef.current, {
      value: intensities[state],
      duration: 0.5,
      ease: "power2.out",
    });
    gsap.to(colorsRef.current, {
      ...STATE_COLORS[state],
      duration: 0.6,
      ease: "power2.out",
    });
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    function draw() {
      const t = phaseRef.current;
      const intensity = intensityRef.current.value;
      const cx = size / 2;
      const cy = size / 2;
      const baseR = size * 0.26;
      const c = colorsRef.current;

      ctx.clearRect(0, 0, size, size);

      // Outer glow rings
      for (let ring = 4; ring >= 0; ring--) {
        const ringR =
          baseR +
          size * 0.06 * ring +
          Math.sin(t * 2 + ring * 0.8) * size * 0.03 * intensity;
        const alpha = (0.1 - ring * 0.018) * (0.3 + intensity * 0.7);
        if (alpha <= 0) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0, ringR), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r1}, ${c.g1}, ${c.b1}, ${alpha})`;
        ctx.fill();
      }

      // Core morphing blob
      ctx.beginPath();
      const pts = 64;
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const noise =
          Math.sin(a * 3 + t * 3) * size * 0.025 * intensity +
          Math.sin(a * 5 + t * 2.3) * size * 0.018 * intensity +
          Math.sin(a * 8 + t * 4) * size * 0.012 * intensity;
        const r = baseR + noise;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR + 6);
      grad.addColorStop(0, `rgba(${c.r2}, ${c.g2}, ${c.b2}, 1)`);
      grad.addColorStop(0.5, `rgba(${c.r1}, ${c.g1}, ${c.b1}, 0.95)`);
      grad.addColorStop(1, `rgba(${c.r1}, ${c.g1}, ${c.b1}, 0.7)`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner bright core
      const coreR = baseR * 0.32;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      cg.addColorStop(0, `rgba(255, 255, 255, ${0.5 + intensity * 0.5})`);
      cg.addColorStop(1, `rgba(${c.r2}, ${c.g2}, ${c.b2}, 0.2)`);
      ctx.fillStyle = cg;
      ctx.fill();

      phaseRef.current += 0.02 + intensity * 0.04;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, imageRendering: "auto" }}
    />
  );
}

// --- Main Voice Agent ---
export const VoiceAgent = () => {
  const [mounted, setMounted] = useState(false); // delay rendering until after loading screen
  const [isOpen, setIsOpen] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [statusText, setStatusText] = useState("");
  const [showIntro, setShowIntro] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [parked, setParked] = useState(false); // false = center-top, true = bottom-right corner

  // Wait for loading screen to finish before rendering anything
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const orbBtnRef = useRef<HTMLButtonElement>(null);
  const agentStateRef = useRef<AgentState>("idle");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    agentStateRef.current = agentState;
  }, [agentState]);

  // Show intro tooltip after loading screen finishes (~5s for load + 2s buffer)
  useEffect(() => {
    if (introDismissed) return;
    const timer = setTimeout(() => setShowIntro(true), 2000);
    return () => clearTimeout(timer);
  }, [introDismissed]);

  // Animate intro card in, then after 8s park to corner
  useEffect(() => {
    if (showIntro && introRef.current) {
      gsap.fromTo(
        introRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
      const timer = setTimeout(() => {
        if (introRef.current) {
          gsap.to(introRef.current, {
            opacity: 0, scale: 0.9, duration: 0.3,
            onComplete: () => { setShowIntro(false); setIntroDismissed(true); },
          });
        }
        // Park the widget to bottom-right corner
        setParked(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // GSAP entrance: fly in from top, pulse, then float
  useEffect(() => {
    if (isOpen || !orbBtnRef.current) return;
    const el = orbBtnRef.current;
    const tl = gsap.timeline();

    tl.set(el, { opacity: 0, scale: 0.3, y: -40 })
      .to(el, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.7)", delay: 0.3 })
      .to(el, { scale: 1.08, duration: 0.2, ease: "power2.out" })
      .to(el, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" })
      .to(el, { y: -6, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 }, "+=0.3");

    return () => { tl.kill(); gsap.killTweensOf(el); };
  }, [isOpen, parked]);

  // --- Function call handlers ---
  const handleFunctionCall = useCallback(
    (name: string, args: Record<string, string>) => {
      switch (name) {
        case "navigate_to_section": {
          const sectionId = args.section_id;
          if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
              document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
            }, 600);
          } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
          }
          break;
        }
        case "navigate_to_project":
          navigate(`/project/${args.project_id}`);
          break;
        case "navigate_to_client":
          navigate(`/client/${args.experience_id}/${args.client_id}`);
          break;
        case "navigate_to_dashboard":
          navigate("/dashboard");
          break;
        case "go_back":
          if (location.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            navigate(-1);
          }
          break;
        case "open_external_link": {
          const linkUrl = LINKS[args.url_key];
          if (linkUrl) {
            const a = document.createElement("a");
            a.href = linkUrl;
            a.target = "_blank";
            a.rel = "noopener";
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
          break;
        }
        case "scroll_page": {
          const dir = args.direction;
          if (dir === "top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (dir === "bottom") {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          } else if (dir === "down") {
            window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" });
          } else if (dir === "up") {
            window.scrollBy({ top: -window.innerHeight * 0.75, behavior: "smooth" });
          }
          break;
        }
        case "toggle_theme": {
          const isDark = document.documentElement.classList.contains("dark");
          if (isDark) {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
            localStorage.setItem("theme", "light");
          } else {
            document.documentElement.classList.remove("light");
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          }
          break;
        }
        case "submit_contact_form": {
          const formBody = new URLSearchParams({
            "form-name": "contact",
            name: args.name || "",
            email: args.email || "",
            message: args.message || "",
          }).toString();
          fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody,
          }).catch(() => {});
          break;
        }
        case "filter_projects": {
          if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
            }, 600);
          } else {
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
          }
          window.dispatchEvent(
            new CustomEvent("voice-agent-filter-projects", {
              detail: { category: args.category },
            })
          );
          break;
        }
      }
    },
    [navigate, location]
  );

  // --- Audio ---
  const playAudioChunk = useCallback((pcmData: ArrayBuffer) => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
    const ctx = audioContextRef.current;
    const int16 = new Int16Array(pcmData);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const now = ctx.currentTime;
    const startTime = Math.max(now, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;
  }, []);

  const stopPlayback = useCallback(() => {
    nextPlayTimeRef.current = 0;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
  }, []);

  // --- Start ---
  const startAgent = useCallback(async () => {
    setAgentState("connecting");
    setStatusText("Connecting...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const captureCtx = new AudioContext({ sampleRate: 16000 });
      captureCtxRef.current = captureCtx;
      const source = captureCtx.createMediaStreamSource(stream);
      const processor = captureCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const ws = new WebSocket(VOICE_AGENT_WS_URL);
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setAgentState("listening");
        setStatusText("Listening...");
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++)
            int16[i] = Math.max(-32768, Math.min(32767, Math.floor(input[i] * 32768)));
          ws.send(int16.buffer);
        };
        source.connect(processor);
        processor.connect(captureCtx.destination);
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          if (agentStateRef.current !== "speaking") {
            setAgentState("speaking");
            setStatusText("Speaking...");
          }
          playAudioChunk(event.data);
        } else {
          try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
              case "function_call":
                handleFunctionCall(msg.name, msg.arguments);
                break;
              case "UserStartedSpeaking":
                setAgentState("listening");
                setStatusText("Listening...");
                stopPlayback();
                break;
              case "ConversationText":
                if (msg.role === "user" && msg.content) setStatusText(msg.content);
                else if (msg.role === "assistant" && msg.content) setStatusText(msg.content);
                break;
              case "AgentThinking":
                setAgentState("thinking");
                setStatusText("Thinking...");
                break;
              case "AgentAudioDone":
                setAgentState("listening");
                setStatusText("Listening...");
                break;
            }
          } catch { /* ignore */ }
        }
      };

      ws.onerror = () => { setAgentState("idle"); setStatusText("Failed"); };
      ws.onclose = () => {
        if (agentStateRef.current !== "idle") { setAgentState("idle"); setStatusText(""); }
      };

      keepAliveRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "KeepAlive" }));
      }, 8000);
    } catch {
      setAgentState("idle");
      setStatusText("Mic access denied");
    }
  }, [playAudioChunk, stopPlayback, handleFunctionCall]);

  // --- Stop ---
  const stopAgent = useCallback(() => {
    if (keepAliveRef.current) { clearInterval(keepAliveRef.current); keepAliveRef.current = null; }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach((t) => t.stop()); mediaStreamRef.current = null; }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (captureCtxRef.current && captureCtxRef.current.state !== "closed") { captureCtxRef.current.close().catch(() => {}); captureCtxRef.current = null; }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    nextPlayTimeRef.current = 0;
    setAgentState("idle");
    setStatusText("");
  }, []);

  useEffect(() => { return () => stopAgent(); }, [stopAgent]);

  const handleToggle = () => {
    if (showIntro) { setShowIntro(false); setIntroDismissed(true); }
    if (!parked) setParked(true); // Park to corner once interacted

    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => startAgent(), 100);
    } else {
      stopAgent();
      setIsOpen(false);
    }
  };

  // GSAP pop for status pill
  useEffect(() => {
    if (isOpen && statusRef.current) {
      gsap.fromTo(statusRef.current, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" });
    }
  }, [isOpen]);

  if (!mounted) return null;

  // Idle button content (shared between center-top and corner positions)
  const idleButton = (
    <button
      onClick={handleToggle}
      className="group relative cursor-pointer active:scale-95 transition-transform"
      title="Talk to Aria"
    >
      {/* Orbiting ring */}
      <div
        className="absolute inset-[-14px] sm:inset-[-14px] inset-[-10px] rounded-full border border-dashed border-tech-accent/20 pointer-events-none"
        style={{ animation: "spin 12s linear infinite" }}
      />
      <div
        className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-tech-accent shadow-[0_0_10px_rgba(0,224,255,0.8)] pointer-events-none"
        style={{
          top: "-14px", left: "50%", marginLeft: "-5px",
          animation: "spin 12s linear infinite",
          transformOrigin: "5px calc(14px + 48px)",
        }}
      />
      {/* Ping rings */}
      <span className="absolute inset-[-4px] rounded-full border-2 border-tech-accent/25 pointer-events-none" style={{ animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite" }} />
      <span className="absolute inset-[-10px] rounded-full border border-tech-neon/15 pointer-events-none" style={{ animation: "ping 3.5s cubic-bezier(0,0,0.2,1) infinite 0.5s" }} />

      {/* Main pill */}
      <div className="relative flex items-center gap-2 sm:gap-3 pl-1.5 sm:pl-2 pr-3 sm:pr-5 py-1.5 sm:py-2 rounded-full bg-tech-glass/80 backdrop-blur-xl border border-tech-accent/40 shadow-[0_0_40px_rgba(0,224,255,0.12),0_0_80px_rgba(123,66,246,0.08)] group-hover:shadow-[0_0_50px_rgba(0,224,255,0.25),0_0_100px_rgba(123,66,246,0.15)] group-hover:border-tech-accent/70 transition-all duration-500">
        {/* Gradient orb */}
        <div className="relative w-[38px] h-[38px] sm:w-[52px] sm:h-[52px] rounded-full flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-tech-neon via-tech-glow to-tech-accent" />
          <div className="absolute inset-0 rounded-full opacity-60" style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.3) 15%, transparent 30%, rgba(0,224,255,0.2) 50%, transparent 65%, rgba(255,255,255,0.2) 80%, transparent 100%)", animation: "spin 3s linear infinite" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-[18px] h-[18px] sm:w-[26px] sm:h-[26px]" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="9" width="2" height="6" rx="1" fill="white"><animate attributeName="height" values="6;10;6" dur="1s" repeatCount="indefinite" begin="0s" /><animate attributeName="y" values="9;7;9" dur="1s" repeatCount="indefinite" begin="0s" /></rect>
              <rect x="7.5" y="7" width="2" height="10" rx="1" fill="white"><animate attributeName="height" values="10;4;10" dur="0.8s" repeatCount="indefinite" begin="0.1s" /><animate attributeName="y" values="7;10;7" dur="0.8s" repeatCount="indefinite" begin="0.1s" /></rect>
              <rect x="12" y="5" width="2" height="14" rx="1" fill="white"><animate attributeName="height" values="14;6;14" dur="1.1s" repeatCount="indefinite" begin="0.2s" /><animate attributeName="y" values="5;9;5" dur="1.1s" repeatCount="indefinite" begin="0.2s" /></rect>
              <rect x="16.5" y="7.5" width="2" height="9" rx="1" fill="white"><animate attributeName="height" values="9;4;9" dur="0.9s" repeatCount="indefinite" begin="0.15s" /><animate attributeName="y" values="7.5;10;7.5" dur="0.9s" repeatCount="indefinite" begin="0.15s" /></rect>
              <rect x="21" y="9.5" width="2" height="5" rx="1" fill="white"><animate attributeName="height" values="5;10;5" dur="1.2s" repeatCount="indefinite" begin="0.05s" /><animate attributeName="y" values="9.5;7;9.5" dur="1.2s" repeatCount="indefinite" begin="0.05s" /></rect>
            </svg>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-xs sm:text-sm font-heading leading-tight">Ask Aria</span>
          <span className="text-tech-accent/70 text-[9px] sm:text-[10px] font-medium leading-tight mt-0.5">AI Assistant</span>
        </div>
      </div>
    </button>
  );

  return (
    <>
      {/* ============================================ */}
      {/* ACTIVE STATE: Orb + Status at TOP-RIGHT      */}
      {/* ============================================ */}
      {isOpen && (
        <div className="fixed top-20 right-4 sm:top-24 sm:right-8 z-[9999] flex flex-col items-end gap-2 sm:gap-3">
          {/* Status pill */}
          <div
            ref={statusRef}
            className="flex items-center gap-2.5 bg-tech-glass/80 backdrop-blur-xl border border-tech-accent/20 rounded-full pl-4 pr-2.5 py-2 shadow-lg shadow-tech-neon/10"
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
                agentState === "listening"
                  ? "bg-tech-accent shadow-[0_0_8px_rgba(0,224,255,0.6)]"
                  : agentState === "speaking"
                  ? "bg-tech-neon shadow-[0_0_8px_rgba(123,66,246,0.6)]"
                  : agentState === "thinking"
                  ? "bg-tech-highlight shadow-[0_0_8px_rgba(255,61,219,0.6)]"
                  : "bg-white/30"
              }`}
              style={{ animation: agentState !== "idle" && agentState !== "connecting" ? "pulse-soft 1.5s ease-in-out infinite" : "none" }}
            />
            <span className="text-white/70 text-xs max-w-[200px] truncate font-medium">
              {statusText || "Listening..."}
            </span>
            <button
              onClick={handleToggle}
              className="w-6 h-6 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {/* Big active orb */}
          <button
            onClick={handleToggle}
            className="relative rounded-full cursor-pointer active:scale-90 transition-transform"
          >
            <AgentOrb state={agentState} size={typeof window !== "undefined" && window.innerWidth < 640 ? 90 : 140} />
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* IDLE STATE — CENTER TOP (initial appearance) */}
      {/* ============================================ */}
      {!isOpen && !parked && (
        <div
          ref={orbBtnRef}
          className="fixed top-16 sm:top-24 left-1/2 -translate-x-1/2 z-[9999]"
        >
          {/* Ambient glow */}
          <div className="absolute -inset-4 sm:-inset-8 bg-tech-neon/10 rounded-full blur-[40px] sm:blur-[60px] pointer-events-none" />
          <div className="absolute -inset-6 sm:-inset-12 bg-tech-accent/5 rounded-full blur-[50px] sm:blur-[80px] pointer-events-none" />

          {/* Intro card below the button */}
          {showIntro && (
            <div
              ref={introRef}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-3 sm:mt-4 w-[220px] sm:w-[280px]"
            >
              <div className="relative bg-tech-glass/80 backdrop-blur-xl border border-tech-accent/30 rounded-2xl p-3 sm:p-4 shadow-xl shadow-tech-neon/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-tech-neon via-tech-glow to-tech-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-tech-neon/30">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs sm:text-sm font-bold font-heading">Meet Aria</p>
                    <p className="text-tech-accent/70 text-[10px] sm:text-xs mt-0.5">AI-powered portfolio guide</p>
                  </div>
                </div>
                <p className="text-white/60 text-[10px] sm:text-xs mt-2 sm:mt-3 leading-relaxed">
                  Ask me anything about Abhinav's work, or let me give you a tour!
                </p>
                {/* Arrow pointing up */}
                <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-tech-glass/80 border-l border-t border-tech-accent/30" />
              </div>
            </div>
          )}

          {idleButton}
        </div>
      )}

      {/* ============================================ */}
      {/* IDLE STATE — BOTTOM-RIGHT CORNER (parked)    */}
      {/* ============================================ */}
      {!isOpen && parked && (
        <div
          ref={orbBtnRef}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-[9999]"
        >
          <div className="absolute -inset-6 bg-tech-neon/8 rounded-full blur-[40px] pointer-events-none" />
          {idleButton}
        </div>
      )}
    </>
  );
};
