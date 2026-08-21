# KESEMPATAN OS User Guide v1.0

<div align="center">
  <sub><strong>Built on a phone • 100% spare-time energy</strong></sub>
  <br>
  <sub><em>"It was done. But I kept adding features anyway. Couldn't stop."</em></sub>
</div>

**Autonomous Opportunity Intelligence System**

55 Multi-Agent AI | 55 AI Workers | Chat | Forum | Debate | Tournament | Rap Battle | Podcast | Voice Clone | 10 Export Formats

---

## Getting Started

### Requirements

- **Browser:** a recent version of Chrome, Firefox, Edge, or Safari (WebGL support needed for 3D)
- **API Key:** not required — KESEMPATAN LLM (the local AI engine) runs directly in the browser with no API key. An external provider's API key is optional (used as a fallback), and can only be entered via the **Settings** menu.

### Installing as an App (PWA)

- **Android (Chrome):** three-dot menu → "Install app" / "Add to Home screen"
- **Desktop (Chrome/Edge):** install icon in the address bar → "Install KESEMPATAN OS"
- **iPhone/iPad (Safari):** Share button → "Add to Home Screen"

Once installed, the app opens directly from the home screen. Analysis features still require an internet connection.

### First Steps

1. Open `index.html` in a browser (or the installed app).
2. **(Optional)** Enter an external provider's API key in **Settings** → AI Configuration.
3. Choose an **Autonomy Mode:** Observe / Plan (default, manual review) / Act (auto-aggregate).
4. Go to **KESBOARD** to start an analysis.

### Execution Modes

| Mode | Speed | Notes |
|---|---|---|
| Sequential | Standard | Agents run one at a time |
| Parallel | 3–10x faster | Enable via KESPREMAI → Parallel Mode |

---

## Navigation (Sidebar)

| Menu | Contents |
|---|---|
| KESBOARD | Main analysis dashboard |
| Observation Engine / Noise Filtering | Signal monitoring & cleanup |
| Memory Manager / Response Cache | Vector memory & response cache |
| Monitoring | Report, Telemetry, Auto-Learning |
| Settings | AI provider, API key, cloud sync, telemetry, system info |
| KESWORKER (55) | Worker management, activity log |
| KESTRAKTIVE | Chat AI, Chat Agent, Forum, Debate, Tournament, Rap Battle |
| KESPREMAI | Podcast, Voice & Clone, Rap Battle, Visualisation, Offline Mode |
| KESMARKET | Live Crypto, News Aggregator |
| KESMEDIA | Social Share, Editor |
| WebSocket / Public API | Team collaboration & integration |

---

## Dashboard & Input Parameters

| Component | Function |
|---|---|
| Topic | The title of the opportunity being analyzed |
| Instructions | Extra guidance for the analysis (optional) |
| File Upload | Supporting data (CSV/JSON/TXT, up to 10MB) |
| Run button | Starts the analysis with the selected agents |
| Category tabs | BUSINESS, SCIENCE & TECH, GENERAL, POLITICS, GLOBAL |
| Execution Log | Real-time results from each agent |
| Timer & Progress | Duration + estimated time remaining |

> **Note:** There's no API key field on the dashboard. All API key configuration happens through **Settings** → AI Configuration.

### Choosing Agents

There are 55 agents across several categories (tabs). Click a tab, check the agents you want, or use **Select All** / **Deselect**. More agents means a more thorough analysis, but it takes longer — use Parallel Mode to speed things up.

### Special Agents

| Agent | Character | Speaking Style |
|---|---|---|
| Kesempatan | Senior Business Advisor | Wise, relaxed, calls you "Boss" |
| Sundanya Asep | Sundanese Entrepreneur | Funny, Sundanese accent |
| Devils Advocate | Critic | Skeptical, enjoys challenging assumptions |

---

## AI Workers (55 Autonomous AI)

55 AI Workers that operate automatically 24/7 with no manual prompting. Go to **KESWORKER (55)** → Worker Management, flip a toggle on, pick a schedule (Realtime/Hourly/Daily/Weekly), click **Run** to trigger one manually, and monitor everything in the Activity Log.

---

## KESEMPATAN LLM — Local AI Engine

A self-built language engine that runs on your phone with no API key. Once it's ready, it becomes the primary engine; until then, the system automatically falls back to an external provider. Training progress is saved permanently; quality is still improving (it's a small model) — this is an experimental piece aimed at full future independence from external providers.

---

## Human-in-the-Loop (HITL)

**Plan** mode shows a HITL panel after execution: **Approve / Reject / Edit Score / Process Final Aggregation**. The system learns from your decisions (Auto-Learning).

---

## Interactive Features (KESTRAKTIVE)

- **Chat AI** — streaming responses + voice output.
- **Chat Agent** — pick 1 of the 55 agents, get answers matching their role, with a distinct voice.
- **Agent Forum** — one question answered by every selected agent; can be stopped at any time.
- **Agent Debate** — 2 agents debate, choose the number of rounds & a moderator, optional voice.
- **Agent Tournament** — bracket elimination (Full 55 / Top 16 / Top 8), Quick or Best-of-3 mode.
- **Rap Battle** — 2 agents battle it out with a chosen topic and number of rounds.

---

## AI Tools (KESPREMAI)

- **AI Podcast** — turns an analysis result into a podcast; choose a voice character & speed; download the script.
- **Voice & Clone** — 19 voice characters (Professional, Casual, Energetic, Wise, Funny, Robot, Elderly, Child, Mysterious, Enthusiastic, Calm, Authoritative, Whisper, Deep, High, Santa, Chipmunk, Demon, Angel); 14 languages; record a 10-second voice sample, save up to 5, have an agent speak in your voice; Live Voice Chat with internal AI agents (Kesempatan, Manager, StartupFounder, DevilsAdvocate, Sundanya Asep).
- **Visualisation** — interactive data visualization.
- **Offline Mode** — local-only operation.

---

## Editor (KESMEDIA)

- **AI Art Generator** — generate images from text via Pollinations.ai (free, no API key).
- **Background Remover** — remove backgrounds (uses a free remove.bg API key).
- **Style Transfer** — restyle an image (uses a free DeepAI API key).

---

## Market & Media

- **Live Crypto** — real-time cryptocurrency prices.
- **News Aggregator** — local news (RSS, no API key) & international news (GNews, optional).
- **Social Share** — share reports to social media.

---

## Understanding Analysis Results

**10 scoring engines:** Demand, Competition, Monetization, Virality, Sustainability, Scalability, Timing, Attention, Execution, Long-term.

| Score | Priority | Recommendation |
|---|---|---|
| ≥85 | HIGH | Top priority |
| 70–84 | MEDIUM | Worth considering |
| 50–69 | LOW | Needs further research |
| <50 | POOR | Avoid |

**Visuals:** Radar Chart, 3D Intelligence Sphere (drag to rotate), Time Analytics (trend line, click a point for details).

---

## Exporting Reports

10 formats: JSON, HTML, PDF, CSV, Excel, PPTX, Google Docs, Google Sheets, Notion, Email.

---

## Collaboration & Public API

- **WebSocket Server:** `npm run websocket` (`ws://localhost:3000`)
- **Public API Server:** `npm run api` (`http://localhost:3456`)
- **Endpoints:** `/health`, `/agents`, `/workers`, `/analyze`, `/report/latest`, `/reports`, `/report/:id`, `/keys/generate`, `/keys`, `/keys/:key`

---

## System Settings

- **AI Configuration** — choose from 21 providers + enter your API key here (the only place to enter an API key).
- **Cloud Sync** — Supabase.
- **Telemetry** — system performance monitoring.
- **System Info** — technical details.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Invalid API key | Make sure the key is correct and has credit; check in Settings |
| Agent not responding | Check your connection, refresh the browser |
| 3D sphere not showing | Make sure your browser supports WebGL |
| IndexedDB error | Clear the site's data, reload |
| Tournament running slow | Use "Quick" mode / Parallel Mode |
| No voice output | Check your volume & Web Speech API support |
| Voice clone failing | Allow microphone access |
| News aggregator error | GNews is optional; local sources keep working |

---

## About the Creator

Built by **Rahmad Raharjo**, a solo developer, 100% from a phone screen — still actively developed. It started as a bit of a side project; it just kept going, all the way to building an AI engine (KESEMPATAN LLM) from scratch.

This is the first time I've built anything like this. I don't have a background in this field — I didn't understand software architecture, didn't know how to build AI, didn't know where to start. Everything was learned along the way: try, fail, fix, repeat. The result is probably still far from perfect, but it's proof that starting from zero, with nothing but a phone, can still get you somewhere.

---

## License

KESEMPATAN OS is licensed under the **KESEMPATAN OS SOFTWARE LICENSE AGREEMENT Version 1.0**. Free for non-commercial use; commercial use requires written permission. Contact: maetalizer@gmail.com. See [`LICENSE`](../LICENSE).

---

<div align="center">
  <sub><strong>Copyright © 2026 KESEMPATAN OS. All Rights Reserved.</strong></sub>
  <br>
  <sub>Creator: Rahmad Raharjo</sub>
</div>
