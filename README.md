<div align="center">
  <img src="https://img.shields.io/badge/KESEMPATAN%20OS-v1.0-brightgreen" alt="Version">
  <img src="https://img.shields.io/badge/license-KESEMPATAN%20OS%20v1.0-blue" alt="License">
  <img src="https://img.shields.io/badge/agents-55-orange" alt="Agents">
  <img src="https://img.shields.io/badge/platform-web%20%7C%20mobile%20%7C%20pwa-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/built%20with-phone%20%2B%20spare%20time-brightgreen" alt="Built with">
</div>

<div align="center">
  <sub><strong>Built 100% on a phone • Day 70 • Still under active development</strong></sub>
  <br>
  <sub><em>"It started as a side project to kill time. It just kept going."</em></sub>
</div>

# KESEMPATAN OS

**Autonomous Opportunity Intelligence System** — an Indonesian-built multi-agent AI platform featuring 55 agents, 55 autonomous AI Workers, a self-built local LLM engine, Sequential/Parallel execution modes, and a wide range of interactive features (Chat, Forum, Debate, Tournament, Rap Battle, Podcast, Voice & Clone).

## About KESEMPATAN OS

KESEMPATAN OS is an autonomous intelligence system that uses **55 AI agents** spanning multiple fields of expertise (business, science, technology, politics, law, and more) to analyze business opportunities, markets, and innovation.

### Core Capabilities
- Run all 55 agents in Sequential or Parallel mode
- Opportunity scoring across 10 evaluation dimensions (Demand, Competition, Monetization, Virality, Sustainability, Scalability, Timing, Attention, Execution, Long-term)
- Radar chart visualization, 3D Intelligence Sphere, and Time Analytics
- Human-in-the-Loop (HITL) — manual review or auto-approve based on a confidence threshold
- A system that learns from user decisions (auto-learning, adaptive thresholds)
- 55 AI Workers running autonomously 24/7 on their own schedules

## KESEMPATAN LLM — A Self-Built Local AI Engine

KESEMPATAN LLM is a language model engine written from scratch in pure JavaScript — not a wrapper around any external AI provider. It runs entirely in the browser via a Web Worker, with a complete transformer architecture (attention, feed-forward layers, BPE tokenizer, sampling, KV-cache) and the ability to train itself further from the platform's own agent data.

**Honest status, as of now:**
- Stable — no longer freezes or hangs, runs in a separate Web Worker away from the UI thread
- Current scale: ~49.6 million parameters — enough to produce sentences that are starting to read coherently
- Learns continuously across sessions (training progress is saved permanently to IndexedDB)
- Still very much learning — its answer quality isn't yet as consistent as major AI providers, so the system automatically falls back to an external provider when needed
- This is a genuine experiment in building AI from the ground up, not just wiring up an API

## Key Features

**Analysis & Visualization**
- 10 scoring engines, an interactive radar chart, 3D Intelligence Sphere, Time Analytics with trend lines
- Observation Engine, Noise Filtering, Memory Manager (vector memory), Response Cache

**Interactive Features (KESTRAKTIVE)**
- CHAT AI — Q&A with the assistant (streaming responses + voice output)
- CHAT AGENT — talk directly with any 1 of the 55 agents
- AGENT FORUM — one question answered by every selected agent
- AGENT DEBATE — two agents argue it out, judged by an AI or the user
- AGENT TOURNAMENT — elimination bracket (Full 55 / Top 16 / Top 8)
- RAP BATTLE — two agents face off in rap-style debate

**AI Tools (KESPREMAI)**
- AI PODCAST — turn analysis results into an audio podcast
- VOICE & CLONE — 19 voice characters, 14 languages, record your own voice (up to 5 clones), Live Voice Chat with internal AI agents
- VISUALISATION — interactive data visualization
- CUSTOM & AUTO AGENT — build agents manually, via AI, or from an image
- OFFLINE MODE — local-only operation

**Market & Media**
- KESMARKET: Live Crypto, News Aggregator (local sources via RSS, no API key required)
- KESMEDIA: Social Share, Editor (AI Art Generator, Background Remover, Style Transfer), Thema (accent color themes)

**System & Integration**
- 55 autonomous AI Workers (Worker Management + Activity Log)
- WebSocket team collaboration, Public API server, a standalone CHAT KESEMPATAN OS page
- Export to 10 formats: JSON, HTML, PDF, CSV, Excel (XLSX), PowerPoint (PPTX), Google Docs, Google Sheets, Notion, Email

**PWA Support**
- Installable to your phone or desktop home screen
- **Install-only service worker (no caching)** — every file update is visible immediately, with no stale cached files left behind; analysis content still requires an internet connection

## Installation & Setup

    # 1. Clone the repository
    git clone https://github.com/username/kesempatan-os.git
    cd kesempatan-os
    # 2. Open index.html in a browser (or serve it with a local live server)

Requirements: a modern browser with WebGL and Web Worker support. External API keys are optional — KESEMPATAN LLM runs without any API key.

## Project Structure

    KESEMPATAN-OS/
     ├── index.html, style.css, manifest.json, sw.js (install-only)
     ├── chat-kesempatan.html   # Standalone chat page
     ├── js/                    # Core app shell modules
     ├── kesem-llm/             # KESEMPATAN LLM (Web Worker)
     ├── memory/                # Vector Memory
     ├── kes-database/          # Core database (IndexedDB)
     ├── agents/                # 55 agents, 5 category files
     ├── workers/               # 55 autonomous AI Workers
     ├── voice-ai/              # Voice, Clone, Podcast, Live Chat
     ├── interactive/           # Chat AI/Agent, Forum, Debate, Tournament
     ├── podcast/, rap/, visual-ai/, observ/, noise/, custom-ai/
     └── USER_GUIDE.md, README.md, LICENCE.txt

## API & AI Providers

KESEMPATAN LLM (local) is the primary pathway once it's ready — no API key needed. Until then, the system falls back to one of **21 external providers** (each optional, each requiring its own API key): Groq, Google Gemini, HuggingFace, DeepSeek, Anthropic Claude, OpenAI, Alibaba Qwen, Cohere, Mistral, AI21, Perplexity, OpenRouter, and more (full list and per-token pricing available on the Settings page).

## Third-Party Component Attribution

| Component | Purpose | License |
|---|---|---|
| Chart.js | Radar/line charts (CDN) | MIT |
| three.js | 3D visualization (CDN) | MIT |
| html2canvas / jsPDF | PDF export (CDN) | MIT |
| lamejs | MP3 export (CDN) | Per its official repository |
| Font Awesome Free | Icons (CDN) | FA Free License |
| Inter (Google Fonts) | Typeface | SIL OFL |

External AI services are governed entirely by their own respective providers' terms — see LICENCE.txt, Section 6.3.

## Development Status — The Honest Version

- KESEMPATAN LLM is still learning — quality keeps improving but isn't yet as consistent as major providers
- The Service Worker is now install-only with no caching — the stale-file issue is permanently resolved; the PWA installs and updates cleanly
- Agent count is 55; AI providers expanded to 21 options
- Database encryption still uses a fixed key (per-device key rotation is planned)
- Several advanced features (constrained JSON output, GPU integration) are still on the roadmap

## Troubleshooting

| Issue | Solution |
|---|---|
| Invalid API key | Make sure the key is correct and has available credit |
| Agent not responding | Check your internet connection, refresh the browser |
| 3D sphere not showing | Make sure your browser supports WebGL |
| IndexedDB error | Clear site data in your browser settings, then reload |
| Updates not showing | The service worker no longer caches; if needed, force a clean load via `?nosw=1` |
| No voice output | Check your volume and make sure your browser supports the Web Speech API |

## License

KESEMPATAN OS is licensed under the **KESEMPATAN OS SOFTWARE LICENSE AGREEMENT Version 1.0**. Free for non-commercial use; commercial use requires written permission. Contact: maetalizer@gmail.com. See `LICENCE.txt`.

## The Story Behind It

This project started out of curiosity and spare-time energy — an experiment to see how far I could get building something entirely from a phone, with no laptop. It turned out to be addictive: one feature led to another, until eventually I was building my own AI engine from scratch. It's now day 70, and it's still going.

This is the first time I've ever built anything like this. I have no background in this field — I didn't understand software architecture, had no idea how to build an AI, and didn't know where to start. Everything was learned along the way: try, fail, fix, repeat. The result is probably still far from perfect, but it's proof that if you're willing to start — even from zero, with nothing but a phone — something real can come out of it.

<div align="center">
  <sub><strong>Copyright © 2026 KESEMPATAN OS. All Rights Reserved.</strong><br>Created by Rahmad Raharjo</sub>
</div>

