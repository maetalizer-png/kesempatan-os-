<div align="center">
  <img src="https://img.shields.io/badge/KESEMPATAN%20OS-v1.0-brightgreen" alt="Version">
  <img src="https://img.shields.io/badge/license-KESEMPATAN%20OS%20v1.0-blue" alt="License">
  <img src="https://img.shields.io/badge/agents-55-orange" alt="Agents">
  <img src="https://img.shields.io/badge/platform-web%20%7C%20mobile%20%7C%20pwa-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/built%20with-phone%20%2B%20spare%20time-brightgreen" alt="Built with">
</div>

<div align="center">
  <sub><strong>Built 100% from a phone • Still actively developed</strong></sub>
  <br>
  <sub><em>"It started as a side project. It just never stopped."</em></sub>
</div>

# KESEMPATAN OS

**Autonomous Opportunity Intelligence System** — a multi-agent AI platform with 55 agents, 55 autonomous AI Workers, a self-built local LLM engine, Sequential/Parallel execution modes, and a range of interactive features (Chat, Forum, Debate, Tournament, Rap Battle, Podcast, Voice & Clone).

## About KESEMPATAN OS

KESEMPATAN OS is an autonomous intelligence system that uses **55 AI agents** across different fields of expertise (business, science, technology, politics, law, etc.) to analyze business opportunities, markets, and innovation.

### Core Capabilities
- Runs 55 agents in Sequential or Parallel mode
- Opportunity scoring across 10 evaluation dimensions (Demand, Competition, Monetization, Virality, Sustainability, Scalability, Timing, Attention, Execution, Long-term)
- Radar chart, 3D Intelligence Sphere, and Time Analytics visualizations
- Human-in-the-Loop (HITL) — manual review or auto-approve based on a confidence threshold
- Learns from user decisions (auto-learning, adaptive thresholds)
- 55 AI Workers running automatically 24/7 on their own schedules

## KESEMPATAN LLM — A Self-Built Local AI Engine

KESEMPATAN LLM is a language model engine written from scratch in plain JavaScript — not a wrapper around any AI provider. It runs entirely in the browser via a Web Worker, with a full transformer architecture (attention, feed-forward, BPE tokenizer, sampling, KV-cache), plus the ability to train itself further from existing agent data.

**Honest status right now:**
- Stable — no longer freezes; runs in a separate Web Worker from the UI
- Current scale: ~49.6 million parameters, enough to produce sentences that are starting to be coherent
- Learns continuously across sessions (training progress is saved permanently in IndexedDB)
- Still learning — answer quality is not yet as consistent as major AI providers; the system automatically falls back to an external provider when needed
- This is a genuine experiment in building AI from scratch, not just wiring up an API

**Performance optimizations:**
- **ADAM Optimizer** — momentum + adaptive learning rate for faster, more stable convergence
- **Contiguous Float32Array** — linear memory buffers, ~50% more efficient than nested arrays
- **In-place Buffer Recycling** — eliminates repeated allocations, minimal GC overhead during training
- **KV-Cache Attention** — caches key/value states, 2–3x faster inference on long sequences
- **Lazy Module Loading** — on-demand modular loading, initial load time under 2 seconds
- **Web Worker Isolation** — the UI stays responsive during heavy training/inference

## Key Features

**Performance & Optimization**
- **ADAM Optimizer** — momentum + adaptive learning rate, ~40% faster convergence vs. SGD
- **Float32 Memory Layout** — linear contiguous buffers, ~50% lower memory usage
- **In-place Updates** — zero-allocation training loops, eliminates GC pressure
- **Web Worker Parallelism** — inference/training run on a background thread, UI stays 100% responsive
- **KV-Cache Attention** — caches key-value states, 2–3x higher inference throughput
- **Lazy Module Loading** — on-demand code splitting, initial load under 2 seconds
- **IndexedDB Persistence** — permanent training checkpoints, instant resume with no memory leaks
- **Buffer Recycling Pool** — pre-allocated memory pools for heavy matrix operations

**Analysis & Visualization**
- 10 scoring engines, interactive Radar Chart, 3D Intelligence Sphere, Time Analytics with trend lines
- Observation Engine, Noise Filtering, Memory Manager (vector memory), Response Cache

**Interactive Features (KESTRAKTIVE)**
- CHAT AI — Q&A with an assistant (streaming + voice output)
- CHAT AGENT — talk directly to 1 of the 55 agents
- AGENT FORUM — one question answered by all selected agents
- AGENT DEBATE — 2 agents argue their positions, judged by AI or a user
- AGENT TOURNAMENT — bracket elimination (Full 55 / Top 16 / Top 8)
- RAP BATTLE — 2 agents battle it out in a rap format

**AI Tools (KESPREMAI)**
- AI PODCAST — turn an analysis result into an audio podcast
- VOICE & CLONE — 19 voice characters, 14 languages, record your own voice (up to 5 clones), Live Voice Chat with internal AI agents
- VISUALISATION — interactive data visualization
- OFFLINE MODE — local-only operation

**Market & Media**
- KESMARKET: Live Crypto, News Aggregator (local sources via RSS, no API key required)
- KESMEDIA: Social Share, Editor (AI Art Generator, Background Remover, Style Transfer)

**System & Integration**
- 55 autonomous AI Workers (Worker Management + Activity Log)
- WebSocket collaboration, Public API server
- Export to 10 formats: JSON, HTML, PDF, CSV, Excel (XLSX), PowerPoint (PPTX), Google Docs, Google Sheets, Notion, Email

**PWA Support**
- Installable to a phone or desktop home screen
- Service worker is **install-only (no caching)** — every file update is visible immediately, nothing stale ever sticks around; analysis features still require an internet connection

## Installation & Running

    # 1. Clone the repository
    git clone https://github.com/maetalizer-png/kesempatan-os-.git
    cd kesempatan-os-
    # 2. Open index.html in a browser (or serve it with a local static server)

Requirements: a modern browser with WebGL & Web Worker support. An external API key is optional (KESEMPATAN LLM runs without one).

## Project Structure

    KESEMPATAN-OS/
     ├── index.html, style.css, manifest.json, sw.js (install-only)
     ├── LICENSE, README.md
     ├── docs/                   # USER_GUIDE.md, ROADMAP.md
     ├── js/                     # Core app shell modules (main, router, workflow, dashboard)
     ├── ai-agent/               # Agent orchestration (registry, planner, tool-registry, etc.)
     ├── kesem-llm/              # KESEMPATAN LLM (Web Worker, engine v1 & v2)
     ├── memory/                 # Vector Memory
     ├── kes-database/           # Core database (IndexedDB)
     ├── agents/                 # 55 agents (5 category files) + prompt loader
     ├── prompts/                # System prompt per agent (JSON)
     ├── dataset/, dataries/     # Supporting analysis datasets
     ├── css/                    # Per-module stylesheets
     ├── features/
     │    ├── kespremai/         # Podcast, Voice & Clone, Rap Battle, Visualisation, Offline
     │    ├── kestraktive/       # Chat AI/Agent, Forum, Debate, Tournament
     │    ├── kesworker/         # 55 autonomous AI Workers
     │    ├── kesmarket/         # Live Crypto, News Aggregator
     │    ├── kesmedia/          # Social Share, Editor
     │    ├── monitoring/        # Telemetry, Report, Learning
     │    ├── observation/, noise/, memory-manager/, websocket/, publicapi/, settings/
     └── dev-simulator/          # Local live-preview dev server (dev only)

## AI Providers & API

KESEMPATAN LLM (local) is the primary path once it's ready — no API key required. Until then, the system falls back to one of **21 external providers** (optional, each with its own API key): Groq, Google Gemini, HuggingFace, DeepSeek, Anthropic Claude, OpenAI, Alibaba Qwen, Cohere, Mistral, AI21, Perplexity, OpenRouter, and more (full list & per-token pricing on the Settings page).

## Third-Party Component Attribution

| Component | Purpose | License |
|---|---|---|
| Chart.js | Radar/line charts (CDN) | MIT |
| three.js | 3D visualization (CDN) | MIT |
| html2canvas / jsPDF | PDF export (CDN) | MIT |
| lamejs | MP3 export (CDN) | Per its official repository |
| Font Awesome Free | Icons (CDN) | FA Free License |
| Inter (Google Fonts) | Font | SIL OFL |

External AI services are governed entirely by each provider's own terms — see `LICENSE`, section 6.3.

## Development Status — Honestly As-Is

- KESEMPATAN LLM is still learning — quality keeps improving but isn't yet as consistent as major providers
- **Performance optimizations already implemented:** ADAM optimizer (~40% faster convergence), Float32 memory layout (-50% memory), in-place updates (zero-allocation loops), KV-cache attention (2–3x faster inference), lazy loading, buffer recycling pools
- Service Worker is now install-only with no caching — the "stale file" issue is permanently solved; the PWA genuinely installs cleanly
- 55 agents, 21 AI providers supported
- Database encryption still uses a fixed key (per-device keys are planned)
- Some advanced features (constrained JSON output, WebGPU-accelerated matrix multiplication) are still on the roadmap

## Troubleshooting

| Issue | Solution |
|---|---|
| Invalid API key | Make sure the key is correct and has available credit |
| Agent not responding | Check your internet connection, refresh the browser |
| 3D sphere not showing | Make sure your browser supports WebGL |
| IndexedDB error | Clear the site's data in your browser settings, then reload |
| Update not showing | The service worker no longer caches; force-refresh via `?nosw=1` if needed |
| No voice output | Check your volume; make sure your browser supports the Web Speech API |

## Contributing

Contributions are welcome — bug reports, bug fixes, new features, documentation, or general cleanup.

1. Fork the repository and create a branch for your change.
2. Keep changes focused — one topic per pull request makes review much easier.
3. Test what you change (this project relies on manual + Playwright-based verification; there's no formal CI yet).
4. Open a pull request with a clear description of what changed and why.

By submitting a contribution (code, documentation, or otherwise), you agree that it is licensed to the KESEMPATAN OS project under the same terms as the [LICENSE](./LICENSE), and that the Creator may use, modify, and distribute it as part of the Software.

## Project Status

KESEMPATAN OS is functional and actively used, but it is a solo-built, evolving project — treat it as such rather than as a polished commercial product.

The Creator's primary focus is shifting toward **RATEGOAN**. Because of that, KESEMPATAN OS is moving toward a more **community-supported maintenance model**: issues and pull requests are welcome, but response times may be slower than before. If you rely on this project, consider forking it or getting involved as a maintainer.

## License

KESEMPATAN OS is licensed under the **KESEMPATAN OS SOFTWARE LICENSE AGREEMENT Version 1.0**. Free for non-commercial use; commercial use requires written permission. Contact: maetalizer@gmail.com. See [`LICENSE`](./LICENSE).

## Behind the Scenes

This project started out of curiosity and a bit of restless energy — an experiment to see how far something could be built directly from a phone, with no laptop involved. It just kept going: one feature led to another, until it eventually included building an AI engine from scratch. It's still going.

This is the first time I've built anything like this. I don't have a background in this field — I didn't understand software architecture, didn't know how to build AI, didn't know where to start. Everything was learned along the way: try, fail, fix, repeat. The result is probably still far from perfect, but it's proof that starting from zero, with nothing but a phone, can still get you somewhere.

<div align="center">
  <sub><strong>Copyright © 2026 KESEMPATAN OS. All Rights Reserved.</strong><br>Created by Rahmad Raharjo</sub>
</div>
