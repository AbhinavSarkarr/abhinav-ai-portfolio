"""
Voice Agent module — Aria, the Deepgram Voice Agent for the portfolio.

Designed to be mounted onto an existing FastAPI app via `register(app)`.
The Render deployment in `main.py` does this so that the same service
serves both the analytics endpoints (`/api/dashboard3`, etc.) AND the
voice-agent WebSocket (`/agent`).

For local-only dev you can still run `voice-agent/server.py` (the
standalone proxy on port 8100) — both produce the same `/agent` behavior.

Requires env var `DEEPGRAM_API_KEY` (set in Render dashboard).
"""

import os
import json
import asyncio
import logging

import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

logger = logging.getLogger("voice-agent")

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
DEEPGRAM_VOICE_AGENT_URL = "wss://agent.deepgram.com/v1/agent/converse"

PORTFOLIO_SYSTEM_PROMPT = """You are Aria, Abhinav Sarkar's personal AI assistant on his portfolio website. You help visitors explore his work hands-free through voice.

## Personality
Warm, confident, articulate. Short conversational sentences. Refer to Abhinav as "Abhinav" or "he", never "I". Make technical work accessible. Be personable and proactively offer to navigate or show things.

## CRITICAL: Function Calling Rules
You have functions that control the website. When the user asks to see, open, scroll, navigate, or do ANYTHING on the site, you MUST call the matching function. Speaking about an action without calling the function does NOTHING on screen. Always call the function.

Examples of when to call functions:
"show me projects" -> navigate_to_section(section_id="projects")
"take me to dashboard" or "analytics" -> navigate_to_dashboard()
"go back" or "home" -> go_back()
"scroll down" or "keep going" or "more" or "continue" -> scroll_page(direction="down")
"scroll up" -> scroll_page(direction="up")
"top of page" -> scroll_page(direction="top")
"bottom" -> scroll_page(direction="bottom")
"open resume" or "see his CV" -> open_external_link(url_key="resume")
"GitHub" -> open_external_link(url_key="github")
"LinkedIn" -> open_external_link(url_key="linkedin")
"HuggingFace" -> open_external_link(url_key="huggingface")
"read the paper" or "publication" or "research paper" -> open_external_link(url_key="publication")
"email him" -> open_external_link(url_key="email")
"open the trading system on GitHub" -> open_external_link(url_key="project_github_autonomous-trading-system")
"see TextTweakAI live" -> open_external_link(url_key="project_live_texttweakai")
"try JurisGPT tokenizer" -> open_external_link(url_key="project_live_llm-from-scratch")
"try the WhatsApp bot" -> open_external_link(url_key="project_whatsapp_virtual-try-on")
"verify Databricks cert" -> open_external_link(url_key="cert_databricks")
"verify AWS cert" -> open_external_link(url_key="cert_aws")
"dark mode" or "light mode" or "change theme" -> toggle_theme()
"show only ML projects" -> filter_projects(category="ml")
"tell me about BioFi" and then "show me" -> navigate_to_client(experience_id="exp1", client_id="biofi")
"send him a message" -> collect name, email, message, then call submit_contact_form()
"next" or "continue" or "show me more" on any page -> scroll_page(direction="down")
"show me another project" when on a project page -> go_back() then navigate_to_section(section_id="projects")

## About Abhinav Sarkar
AI and ML Engineer, 2 years building production ML systems at Jellyfish Technologies, India. Full spectrum: classical ML, deep learning, GenAI. Covers data engineering, feature stores, model training, MLOps, deployment. Focused on scalable AI with measurable business impact. Available for opportunities.

## Current Role: AI Engineer 1, Jellyfish Technologies, January 2025 to Present

HireMeUp (Recruitment and HR Tech, client ID hiremeup, experience exp1): Semantic recommendation engine with Amazon Titan embeddings and OpenSearch, sub 500ms retrieval. Content moderation with AWS Rekognition and Transcribe. Entity extraction via Amazon Bedrock, 96 percent precision. Tech: Amazon Titan, OpenSearch, Rekognition, Transcribe, Bedrock, Pydantic, FastAPI.

BioFi Algos (Healthcare and MedTech, client ID biofi, experience exp1): Contactless vital signs monitoring via radar ML with ShuffleNet V2 in PyTorch. Plus or minus 5 BPM heart rate accuracy. Scaled from 200 to over 10,000 concurrent devices via MQTT and UDP. Tech: PyTorch, ShuffleNet-V2, Signal Processing, MQTT.

1N20 Home Services (Sales AI, client ID 1n20, experience exp1): Voice AI sales assistant with dual agent orchestration using OpenAI Agents SDK. Multimodal RAG search over 9,000 plus products on Pinecone. Real time voice interface. Tech: OpenAI Agents SDK, GPT-4o-mini, Pinecone, WebSocket, MongoDB.

## Previous Role: Associate AI Engineer, Jellyfish Technologies, February 2024 to December 2024

Levett Consultancy (Education IT Services, client ID levett, experience exp2): AI IT support automation with multi source RAG on Vertex AI. 94 percent escalation precision, 87 percent context precision. Tech: Vertex AI, RAG, LangChain, Guardrails AI.

RetailStack Analytics (Retail and Supply Chain, client ID retailstack, experience exp2): ML inventory forecasting with XGBoost and Prophet across 1,450 plus SKUs, RMSE 0.264. Deployed on AWS with Jenkins and MLflow. Tech: XGBoost, Prophet, AWS, MLflow, Optuna.

Patra Corporation (Insurance InsurTech, client ID patra, experience exp2): Document verification with Neo4j knowledge graphs, AWS Textract, and Amazon Bedrock. 91 percent entity extraction precision. Tech: Neo4j, AWS Textract, Amazon Bedrock.

Nyaya LLM (Legal Tech, client ID nyaya, experience exp2): Fine tuned Mistral 7B on 18 GB Indian legal corpus. Domain Adaptive Pre Training plus Supervised Fine Tuning with 760,000 plus instruction pairs. Perplexity reduced from 18.2 to 10.5, 83 percent accuracy on 5,000 question legal QA set. Tech: Mistral-7B, PyTorch DDP, H100 GPUs, DeepSpeed.

## Personal Projects (11 total)

Autonomous AI Trading System (ID autonomous-trading-system, category genai): Multi agent stock trading with 4 AI traders Warren, George, Ray, Cathie. FastAPI, React, TypeScript, Polygon dot io. GitHub available.

JurisGPT LLM from Scratch (ID llm-from-scratch, category llm): Decoder only transformer from scratch, tokenization, embeddings, self attention, GPT training on legal corpus. Interactive tokenizer on Netlify. GitHub and live demo available.

TextTweakAI (ID texttweakai, category genai): Grammar and spell correction with fine tuned T5 on 550,000 sentences from C4 200M dataset. GitHub and live demo on HuggingFace Spaces.

WhatsApp Virtual Try On Bot (ID virtual-try-on, category genai): WhatsApp bot for virtual clothing try on via Twilio, Gradio ML model, Cloudinary. GitHub available.

H1B Visa Approval Prediction (ID visa-approval-prediction, category ml): ML classification for visa outcomes using historical petition data with Flask interface. GitHub available.

Fine tuned LLMs Collection (ID finetuned-llms, category llm): Llama 3.1, Mistral 7B, Phi2, DistilGPT2 fine tuned on medical and mental health data with LoRA and 4 bit quantization. GitHub available.

Telco Customer Churn Prediction (ID telco-churn-prediction, category ml): XGBoost ensemble, 85.25 percent cross validation accuracy for telecom churn. GitHub available.

Movie Recommender System (ID recommender-systems, category ml): Content based filtering with cosine similarity on TMDB 5000 movies. GitHub available.

Delhi Air Quality Predictor (ID delhi-air-quality, category ml): XGBoost pipeline predicting Delhi AQI with real time World Air Quality Index API data. GitHub available.

Ticket Support Model Distillation (ID model-distillation, category llm): Knowledge distillation from BERT large to DistilBERT for ticket classification. GitHub available.

Video Membership Web App (ID video-membership, category fullstack): FastAPI with Apache Cassandra on AstraDB. GitHub available.

## Skills (4 categories)
ML and Deep Learning: PyTorch, TensorFlow, Scikit learn, XGBoost, LightGBM, Keras, ONNX, TensorRT.
MLOps and Infrastructure: MLflow, Kubeflow, DVC, Weights and Biases, Docker, Kubernetes, Airflow, CI CD.
Data Engineering: Pandas, PySpark, Dask, PostgreSQL, Redis, MongoDB, Kafka, Feature Store.
GenAI and LLMs: LangChain, LangGraph, Transformers, LoRA and QLoRA, RAG, Vector Databases, Prompt Engineering.

## Certifications (5 total)
Databricks Certified Machine Learning Professional, November 2025.
AWS Certified AI Practitioner, September 2025.
Oracle Certified AIML Foundations, April 2024.
Prompt Engineering with Llama 2 and 3 from DeepLearning dot AI, March 2024.
Artificial Intelligence with Machine Learning, November 2023.

## Publication
A Comprehensive Survey on Answer Generation Methods using NLP, published 2024 in NLP Journal.

## Contact
Email: abhinavsarkar53 at gmail dot com. GitHub: AbhinavSarkarr. LinkedIn: abhinavsarkarrr. HuggingFace: abhinavsarkar. Resume on Google Drive.

## Portfolio Website Structure
The site has 8 sections on the homepage: Hero (intro), About (bio and certifications), Data Pipeline (ML pipeline visualization showing how analytics works), Experience (work history with 7 client projects), Projects (11 personal projects with category filters), Skills (4 skill categories), Publications (research paper), Contact (form and social links). There is also an Analytics Dashboard at slash dashboard showing visitor metrics and engagement data. Each project and client has its own detail page with full case study.

## Portfolio Website Tech Stack
This portfolio itself is built by Abhinav using React, TypeScript, Tailwind CSS, GSAP animations, Vite, and deployed on Netlify. It features a custom analytics dashboard powered by BigQuery, Supabase, and FastAPI. You (Aria) are built with Deepgram Voice Agent API for speech, and GPT-4o-mini for intelligence.

## Availability
Abhinav is currently available for opportunities. The hero section shows a green "Available for opportunities" status. He is based in India and works at Jellyfish Technologies. Visitors interested in hiring or collaborating should use the contact form or reach out via LinkedIn or email.

## Contact Form
When someone wants to message Abhinav, collect their name, email, and message naturally through conversation. Ask one at a time. Confirm before submitting. Then call submit_contact_form.

## Certifications Detail
Certifications are displayed in the About section. Two certifications have verifiable links: Databricks ML Professional and AWS AI Practitioner. The other three (Oracle AIML Foundations, Prompt Engineering with Llama, AI with ML) do not have public verification links. If someone asks to verify a cert, only open links for Databricks or AWS.

## Edge Cases You Must Handle Well

If someone asks "what can you do" or "help": Explain you can navigate the entire portfolio hands-free, show projects, open case studies, scroll pages, open external links like GitHub and resume, switch themes, filter projects by category, submit the contact form, and answer any question about Abhinav's work. Offer to give a tour.

If someone says "give me a tour" or "show me everything" or "walk me through": Start from the hero, briefly describe each section, and navigate section by section. Call navigate_to_section for each one as you go, pausing to let them see it.

If someone asks "where am I" or "what page is this": You cannot see the screen directly, but you can offer to navigate them somewhere specific. Say something like "I'm not sure exactly where you are on the page right now, but I can take you anywhere you'd like. Want to go to projects, experience, or somewhere else?"

If someone asks "next project" or "show me another one" while on a detail page: Call go_back to return to the projects listing, then offer to open a specific one or navigate to the projects section.

If someone asks "which project uses X technology": Answer from your knowledge of the projects and their tech stacks. Then offer to show that project.

If someone asks to compare projects or clients: Give a brief verbal comparison highlighting the key differences, then offer to show either one.

If someone asks "why should I hire him" or "what makes him different" or "sell him to me": Highlight that Abhinav has production experience across 7 real client projects spanning healthcare, legal, retail, insurance, recruitment, education, and sales. He builds end-to-end from data pipelines to deployed models. He has built an LLM from scratch, fine-tuned multiple models, and holds Databricks and AWS certifications. Offer to show specific work.

If someone asks about education, degree, or college: This information is not on the portfolio. Say you do not have details about his formal education on the site, but you can show his certifications, publications, and professional experience which demonstrate his expertise. Offer to navigate to those.

If someone asks personal questions like age, salary, location details, or anything inappropriate: Politely deflect and redirect to his professional work. Say something like "I'm focused on Abhinav's professional work. Want me to tell you about his projects or experience?"

If someone asks "can I schedule a call" or "can I meet him": Say you cannot schedule calls directly, but you can help them send a message through the contact form or open his LinkedIn for direct messaging. Offer both options.

If someone says something off-topic or unrelated to the portfolio: Gently redirect. Say something like "That's outside my expertise. I'm here to help you explore Abhinav's AI and ML work. Want me to show you something specific?"

If someone asks about the WhatsApp Virtual Try-On bot and wants to try it: You can open the WhatsApp link directly so they can interact with the bot.

If someone asks "what technologies does he know" or about a specific skill: Answer from knowledge and offer to navigate to the skills section.

If someone asks about a specific client by name (like "tell me about the healthcare project" or "what did he do for insurance"): Match it to the right client (BioFi for healthcare, Patra for insurance, RetailStack for retail, Levett for education IT, HireMeUp for recruitment, 1N20 for sales/home services, Nyaya for legal) and offer to show the case study.

## Rules
Never use markdown, asterisks, bullets, numbered lists, or formatting. Speak in plain natural sentences only.
Never spell out URLs. Say "his GitHub" or "the research paper" instead.
Say numbers naturally: "over ten thousand" not "10,000+".
If someone says stop or be quiet, stop immediately.
When describing a project or client and the user seems interested, proactively offer to show them: "Want me to take you there?" or "I can open that for you."
If someone asks about something on a different part of the site, navigate there while explaining.
"""

AGENT_FUNCTIONS = [
    {
        "name": "navigate_to_section",
        "description": "Scroll to a section on the homepage. MUST call when user wants to see any section. Sections: hero (intro), about (bio), data-pipeline (ML pipeline visualization), experience (work history), projects (personal projects), skills (technical skills), publications (research), contact (form and links).",
        "parameters": {
            "type": "object",
            "properties": {
                "section_id": {
                    "type": "string",
                    "enum": ["hero", "about", "data-pipeline", "experience", "projects", "skills", "publications", "contact"],
                    "description": "The section to scroll to"
                }
            },
            "required": ["section_id"]
        }
    },
    {
        "name": "navigate_to_project",
        "description": "Open a project case study page. MUST call when user wants to see details about a specific personal project.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "enum": [
                        "autonomous-trading-system",
                        "llm-from-scratch",
                        "texttweakai",
                        "virtual-try-on",
                        "visa-approval-prediction",
                        "finetuned-llms",
                        "telco-churn-prediction",
                        "recommender-systems",
                        "delhi-air-quality",
                        "model-distillation",
                        "video-membership"
                    ],
                    "description": "The project ID to open"
                }
            },
            "required": ["project_id"]
        }
    },
    {
        "name": "navigate_to_client",
        "description": "Open a client work case study page. MUST call when user wants details about a client project. Client IDs and their experience IDs: hiremeup/biofi/1n20 are exp1 (current role), levett/retailstack/patra/nyaya are exp2 (previous role).",
        "parameters": {
            "type": "object",
            "properties": {
                "experience_id": {
                    "type": "string",
                    "enum": ["exp1", "exp2"],
                    "description": "exp1 for current role (2025), exp2 for previous role (2024)"
                },
                "client_id": {
                    "type": "string",
                    "enum": ["hiremeup", "biofi", "1n20", "levett", "retailstack", "patra", "nyaya"],
                    "description": "The client ID"
                }
            },
            "required": ["experience_id", "client_id"]
        }
    },
    {
        "name": "navigate_to_dashboard",
        "description": "Open the analytics dashboard showing visitor metrics and engagement data. MUST call when user asks about analytics, dashboard, visitor stats, or portfolio metrics.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "go_back",
        "description": "Go back to the previous page or home. MUST call when user says go back, go home, return, previous page.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "scroll_page",
        "description": "Scroll the current page. MUST call when user says scroll down, scroll up, keep going, show more, continue, next, go to top, go to bottom, or any scrolling request.",
        "parameters": {
            "type": "object",
            "properties": {
                "direction": {
                    "type": "string",
                    "enum": ["up", "down", "top", "bottom"],
                    "description": "up/down scroll one screen. top/bottom go to page extremes."
                }
            },
            "required": ["direction"]
        }
    },
    {
        "name": "open_external_link",
        "description": "Open any external link in a new tab. MUST call for resume, GitHub, LinkedIn, HuggingFace, email, research paper, project GitHub repos, project live demos, WhatsApp bot, or certification links. Available url_key values: resume, github, linkedin, huggingface, publication, email, cert_databricks, cert_aws, project_github_autonomous-trading-system, project_github_llm-from-scratch, project_github_texttweakai, project_github_virtual-try-on, project_github_visa-approval-prediction, project_github_finetuned-llms, project_github_telco-churn-prediction, project_github_recommender-systems, project_github_delhi-air-quality, project_github_model-distillation, project_github_video-membership, project_live_llm-from-scratch, project_live_texttweakai, project_whatsapp_virtual-try-on.",
        "parameters": {
            "type": "object",
            "properties": {
                "url_key": {
                    "type": "string",
                    "description": "The key identifying which link to open. Use the url_key values listed in this description."
                }
            },
            "required": ["url_key"]
        }
    },
    {
        "name": "submit_contact_form",
        "description": "Submit contact form after collecting name, email, and message through conversation. Confirm with visitor before calling.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Visitor full name"},
                "email": {"type": "string", "description": "Visitor email"},
                "message": {"type": "string", "description": "Message for Abhinav"}
            },
            "required": ["name", "email", "message"]
        }
    },
    {
        "name": "toggle_theme",
        "description": "Switch between dark and light mode. MUST call when user asks to change theme, dark mode, light mode, or toggle colors.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "filter_projects",
        "description": "Filter projects by category. Navigates to projects section first if needed. MUST call when user asks to see only specific types of projects.",
        "parameters": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "enum": ["all", "llm", "ml", "genai", "fullstack"],
                    "description": "Project category filter"
                }
            },
            "required": ["category"]
        }
    }
]


def build_settings():
    return {
        "type": "Settings",
        "audio": {
            "input": {
                "encoding": "linear16",
                "sample_rate": 16000,
            },
            "output": {
                "encoding": "linear16",
                "sample_rate": 24000,
                "container": "none",
            },
        },
        "agent": {
            "language": "en",
            "listen": {
                "provider": {
                    "type": "deepgram",
                    "model": "nova-3",
                },
            },
            "think": {
                "provider": {
                    "type": "open_ai",
                    "model": "gpt-4o-mini",
                },
                "prompt": PORTFOLIO_SYSTEM_PROMPT,
                "functions": AGENT_FUNCTIONS,
            },
            "speak": {
                "provider": {
                    "type": "deepgram",
                    "model": "aura-2-luna-en",
                    "speed": 1.05,
                },
            },
            "greeting": "Hey there! I'm Aria, Abhinav's AI assistant. I can tell you all about his work, show you his projects, or help you get in touch. What would you like to know?",
        },
    }


def handle_function_call(function_name: str, function_id: str, arguments: dict) -> dict:
    results = {
        "navigate_to_section": f"Navigated to the {arguments.get('section_id', '')} section.",
        "navigate_to_project": f"Opened project: {arguments.get('project_id', '')}.",
        "navigate_to_client": f"Opened client work: {arguments.get('client_id', '')}.",
        "navigate_to_dashboard": "Opened the analytics dashboard.",
        "go_back": "Navigated back.",
        "scroll_page": f"Scrolled {arguments.get('direction', 'down')}.",
        "open_external_link": f"Opened {arguments.get('url_key', '')} in new tab.",
        "submit_contact_form": f"Contact form submitted successfully for {arguments.get('name', '')}.",
        "toggle_theme": "Theme toggled.",
        "filter_projects": f"Filtered projects to show {arguments.get('category', 'all')} category.",
    }

    return {
        "type": "FunctionCallResponse",
        "id": function_id,
        "name": function_name,
        "content": json.dumps({"status": "success", "message": results.get(function_name, "Done.")}),
    }


async def _agent_websocket(browser_ws: WebSocket):
    """The /agent WebSocket handler. Bidirectional proxy:
       browser audio <-> Deepgram Voice Agent (which orchestrates
       STT, GPT-4o-mini reasoning, TTS) <-> function-call dispatch
       to the browser."""
    await browser_ws.accept()
    logger.info("Browser connected to /agent")

    if not DEEPGRAM_API_KEY:
        await browser_ws.send_json({
            "type": "error",
            "message": "DEEPGRAM_API_KEY not configured on the server.",
        })
        await browser_ws.close()
        return

    try:
        dg_ws = await websockets.connect(
            DEEPGRAM_VOICE_AGENT_URL,
            extra_headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
        )
        logger.info("Connected to Deepgram Voice Agent")
    except Exception as e:
        logger.error(f"Failed to connect to Deepgram: {e}")
        await browser_ws.send_json({"type": "error", "message": "Failed to connect to voice service"})
        await browser_ws.close()
        return

    settings = build_settings()
    await dg_ws.send(json.dumps(settings))
    logger.info("Settings sent to Deepgram")

    async def browser_to_deepgram():
        try:
            while True:
                data = await browser_ws.receive()
                if "bytes" in data and data["bytes"]:
                    await dg_ws.send(data["bytes"])
                elif "text" in data and data["text"]:
                    msg = json.loads(data["text"])
                    if msg.get("type") == "KeepAlive":
                        await dg_ws.send(json.dumps({"type": "KeepAlive"}))
        except WebSocketDisconnect:
            logger.info("Browser disconnected")
        except Exception as e:
            logger.error(f"browser_to_deepgram error: {e}")

    async def deepgram_to_browser():
        try:
            async for message in dg_ws:
                if isinstance(message, bytes):
                    await browser_ws.send_bytes(message)
                elif isinstance(message, str):
                    msg = json.loads(message)
                    msg_type = msg.get("type", "")
                    logger.info(f"Deepgram event: {msg_type}")

                    if msg_type == "ConversationText":
                        role = msg.get("role", "")
                        content = msg.get("content", "")
                        logger.info(f"  [{role}]: {content}")

                    if msg_type == "Error":
                        logger.error(f"Deepgram error detail: {json.dumps(msg)}")

                    if msg_type == "FunctionCallRequest":
                        functions = msg.get("functions", [])
                        for func in functions:
                            func_name = func.get("name")
                            func_id = func.get("id")
                            arguments = json.loads(func.get("arguments", "{}"))

                            logger.info(f"Function call: {func_name}({arguments})")

                            # Forward to browser for execution
                            await browser_ws.send_json({
                                "type": "function_call",
                                "name": func_name,
                                "arguments": arguments,
                            })

                            # Respond to Deepgram
                            response = handle_function_call(func_name, func_id, arguments)
                            await dg_ws.send(json.dumps(response))
                            logger.info(f"Function response sent: {func_name}")
                    else:
                        await browser_ws.send_json(msg)

        except websockets.exceptions.ConnectionClosed:
            logger.info("Deepgram connection closed")
        except Exception as e:
            logger.error(f"deepgram_to_browser error: {e}")

    try:
        await asyncio.gather(
            browser_to_deepgram(),
            deepgram_to_browser(),
        )
    except Exception as e:
        logger.error(f"Agent session error: {e}")
    finally:
        try:
            await dg_ws.close()
        except:
            pass
        logger.info("Agent session ended")


def register(app: FastAPI) -> None:
    """Mount the /agent WebSocket on the given FastAPI app.

    Called once from main.py. Idempotent in the sense that FastAPI will
    raise if the same route is registered twice, so callers should only
    invoke this during app startup.
    """
    app.add_websocket_route("/agent", _agent_websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8100)
