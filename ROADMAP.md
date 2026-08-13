# ROADMAP KESEMPATAN OS — v2 (Gabungan)

*Dokumen ini menggabungkan roadmap strategis awal (Fase 0-5) dengan hasil kerja nyata yang sudah dieksekusi dan diverifikasi di codebase. Statusnya bukan rencana di atas kertas — setiap item "Selesai" di bawah ini sudah diverifikasi lewat Playwright (regresi 25 halaman + unit test) dan sudah live di `main`.*

*Terakhir diperbarui: setelah reorganisasi struktur folder + perbaikan delay awal aplikasi.*

---

## Bagian A — Peta Struktur & Alur Kerja Saat Ini

### A.1 Alur boot aplikasi (dari user membuka app sampai siap pakai)

```
index.html dimuat
  │
  ├─► CSS kritikal (style.css, css/core/*, css/dashboard/*, css/agent-runtime/*)
  │     load langsung — TIDAK ada lagi <link> render-blocking ke domain
  │     eksternal (Google Fonts sudah non-blocking, pola sama dgn Font Awesome)
  │
  ├─► Modul eager (type="module", urut dependency):
  │     kes-database/ → agents/*.js (55 prompt via prompts/*.json) →
  │     js/agent-runtime/ → js/core/{config,utils}.js →
  │     js/ai-io/{ai-clients,response-cache,cache-db-bridge}.js →
  │     memory/m-memory.js → js/dashboard/*.js (panel dashboard) →
  │     kesem-llm/*.js → js/workflow/*.js → js/core/main.js →
  │     interactive/*.js (shell chat/forum/debat/turnamen) →
  │     custom-ai/, workers/ai-worker.js → pages/pages.js →
  │     js/core/{ui-handlers,router}.js → ai-agent/agent-runtime.js →
  │     background.js (partikel 3D dekoratif)
  │
  └─► js/core/router.js aktif — sisanya (rap/, voice-ai/, visual-ai/,
        podcast/, observ/, noise/, dataries/world.js, js/news-aggregator.js,
        js/api-public.js, js/ai-editor-ultimate.js) di-import() ON-DEMAND
        cuma saat halaman sidebar terkait dibuka — bukan di boot.
```

**Kenapa first paint sekarang cepat (~130ms, dulu ~13 detik):** akar masalahnya
BUKAN jumlah file JS, tapi satu `<link rel="stylesheet">` ke
`fonts.googleapis.com` yang render-blocking — kalau koneksi ke domain itu
lambat/diblokir (jaringan HP tertentu, firewall, region tertentu), SELURUH
halaman ikut tertahan sampai request itu selesai/gagal. Sudah diperbaiki
dengan pola non-blocking yang sama seperti Font Awesome (`media="print"` +
`onload` swap). Diukur nyata lewat Playwright network trace, bukan tebakan.

### A.2 Peta folder (per fungsi, bukan per abjad)

```
kesempatan-os-/
│
├── js/                          — logika balik-layar & dashboard utama
│   ├── core/                    — bootstrap: main, router, ui-handlers, config, utils
│   ├── workflow/                — mesin orkestrasi 55 agen (workflow, parallel, state, llm-bridge)
│   ├── ai-io/                   — jalur keluar-masuk AI: ai-clients (21 provider), response-cache, cache-db-bridge
│   ├── agent-runtime/           — kontrol & render 55 agen (agent-control, agent-pool, agent-renderer)
│   ├── dashboard/                — widget dashboard utama (chart, hitl, export, metrics-panel,
│   │                                time-analytics-panel, log-panel, report-panel/dock,
│   │                                execute-panel, threshold, three-viz, conten-dasboard)
│   └── (12 file fitur sidebar tetap di sini — lihat A.3)
│
├── css/                          — mengikuti nama folder js/ PERSIS
│   ├── core/                     — global, layout, sidebar, responsive, brand, checkbox, light-mode
│   ├── agent-runtime/            — agent-grid.css
│   └── dashboard/                — card-headings, charts, export-social, forms, hitl, log, metrics, toast
│
├── agents/                       — definisi 55 agen (agents-config/general/politics/global,
│                                    agent-science.js) + prompt-loader.js (loader JSON bersama)
├── prompts/                      — 55 file *.json (agentId, text, sections, opening, headingStyle) —
│                                    `text` = sumber kebenaran tunggal yang dipakai runtime
├── dataset/                      — 165 entri konteks LLM lokal, 5 domain (bisnis/general/politik/
│                                    global/sains), dipakai buildBootstrapCorpus() secara lazy-load
├── dataries/                     — RAG/world-knowledge (country, city, lingo, marplace, paluang, sapaan)
├── kesem-llm/                    — engine LLM custom dari nol (transformer, attention, tokenizer BPE,
│                                    sampler + constrained JSON grammar, trainer, checkpoint, GPU self-test)
├── kes-database/, memory/         — persistensi terenkripsi (IndexedDB) + vector memory
├── ai-agent/                      — orkestrasi agent-to-agent (planner, orchestrator, tool-registry,
│                                    result-evaluator, provider-router, dst.)
├── pages/                         — Telemetry, Settings, Report, Auto-Learning, Memory Manager
├── (folder fitur sidebar, tidak disentuh reorganisasi ini):
│    rap/, voice-ai/, visual-ai/, custom-ai/, interactive/, workers/, podcast/,
│    observ/, noise/
└── dev-simulator/                 — tool live-preview lokal (bukan bagian app produksi)
```

### A.3 File fitur sidebar di `js/` (sengaja TIDAK dipindah)

12 file berikut tetap di `js/` root karena masing-masing = satu fitur di
sidebar, bukan infrastruktur backend/dashboard:

| File | Halaman sidebar |
|---|---|
| `social-share.js` | Share Sosmed |
| `live-crypto.js` | Live Crypto |
| `custom-theme.js` | Custom Theme |
| `offline-mode.js` | Mode Offline |
| `ai-voice-agents.js` | Voice & Clone |
| `reaction-learning.js`, `threshold-learning.js` | Auto-Learning |
| `news-aggregator.js` | News Aggregator |
| `api-public.js` | Public API |
| `ai-editor-ultimate.js`, `ai-editor-worker.js` | Edit Foto |
| `collab.js` | Kolaborasi (WebSocket) |

---

## Bagian B — Status Roadmap per Fase

### ✅ Fase 0 — Stabilisasi Fondasi (SELESAI)

| Item | Status |
|---|---|
| Constrained JSON output di sampler | ✅ `kesem-llm/llm-json-grammar.js` + wiring `llm-sampler.js`/`llm-runtime.js`, opt-in `constrainJSON:true` |
| Enkripsi per-perangkat | ✅ Sudah PBKDF2 + AES-256-GCM (audit menemukan ini SUDAH benar, roadmap awal salah asumsi) |
| Observability dasar (dashboard fallback-rate) | ✅ Telemetry page: engine health, fallback rate, bucket local-v2/local/external |
| Test coverage nyata | ✅ 42 unit test perilaku nyata (scoring engine, AGENTS_CONFIG, sampler, JSON grammar) |

### ✅ Fase 1 — KESEMPATAN LLM Naik Kelas (SEBAGIAN — realistis untuk solo dev)

| Item | Status |
|---|---|
| WebGPU self-test | ✅ `llm-gpu.js` aktif, disurfacekan di Telemetry ("Akselerasi GPU") |
| WebGPU dipakai di hot forward-pass | ⏳ Belum — sandbox pengembangan tidak punya `navigator.gpu` untuk verifikasi aman, ditunda sampai bisa diuji nyata di device ber-GPU |
| Distilasi dari provider eksternal | ⏳ Belum — bagian dari Bagian B (training-console), lihat Bagian D |
| Quantization sebagai default | ⏳ Modul `llm-quantization.js` sudah ada, belum dijadikan jalur default |
| Mixture-of-Specialists / adapter per klaster | ⏳ Belum dimulai |

### 🆕 Pekerjaan tambahan sesi ini (di luar Fase 0/1 asli, tapi memperkuat fondasi)

| Item | Status |
|---|---|
| 55 prompt agen: `.txt` → `.json` | ✅ Skema lossless (`text` = sumber asli byte-for-byte), 5 `loadPrompt()` duplikat digabung ke `agents/prompt-loader.js` |
| Dataset konteks LLM lokal | ✅ `dataset/` — 165 entri, 5 domain, terhubung ke `buildBootstrapCorpus()` dengan batas eksplisit (anti-lambat) |
| Perbaikan delay awal aplikasi | ✅ First paint 13 detik → ~130ms (akar masalah: Google Fonts render-blocking) |
| Reorganisasi struktur folder `js/`+`css/` | ✅ 27 file backend/dashboard → 5 subfolder bermakna, css/ mengikuti nama yang sama |

### ⏳ Fase 2 — Orkestrasi Multi-Agent 2.0 (BELUM DIMULAI SESI INI)

Fondasi `ai-agent/` (planner, orchestrator, tool-registry, result-evaluator,
provider-router) sudah dibangun di sesi-sesi sebelumnya. Yang tersisa:

1. **Tool-calling terstandar** — skema jelas per kapabilitas (cek harga
   crypto, ambil berita, export dokumen), bukan fungsi yang menempel ke satu
   fitur. `ai-agent/tool-registry.js` sudah jadi tempatnya, tinggal
   diperluas cakupannya ke kapabilitas yang belum terdaftar.
2. **Agent-to-agent evaluation loop** — pakai `result-evaluator.js` supaya
   agen saling mengaudit (mis. "Risk Manager" mengaudit "Startup Founder")
   sebelum masuk skor akhir 10 dimensi.
3. **Dynamic agent routing berbasis confidence** — perluas
   `provider-router.js` jadi agent-router: sistem otomatis memilih subset
   agen relevan berdasar jenis pertanyaan, bukan Sequential/Parallel statis.
4. **Memory-bridge sebagai shared context** — pastikan `memory-bridge.js`
   benar-benar dipakai lintas 55 agen + 55 worker.

### ⏳ Fase 3 — Memory & Retrieval Presisi (BELUM DIMULAI SESI INI)

1. Chunking + embedding pipeline konsisten untuk `dataries/*` (bukan cuma
   dataset/ — dataset/ dibuat untuk training corpus, `dataries/` untuk RAG).
2. Hybrid search (vector similarity + keyword) supaya data numerik/nama
   spesifik tidak "hilang" di pencarian semantik murni.
3. Feedback loop HITL → memory: koreksi manusia (`hitl.js`) disimpan sebagai
   memory entry berbobot tinggi.

### ⏳ Fase 4 — Multimodal & Edge (BELUM DIMULAI SESI INI)

1. Voice loop dua arah lebih natural (speech-to-speech langsung).
2. Visual reasoning ringan (model vision kecil di browser sebelum fallback
   eksternal).
3. Offline-mode yang benar-benar offline (LLM lokal + memory lokal jadi
   default, provider eksternal jadi cadangan terakhir, bukan diam-diam
   default).

### ⏳ Fase 5 — Trust, Observability & Skala Ekosistem (BELUM DIMULAI SESI INI)

1. Audit trail untuk 55 worker otonom + circuit breaker otomatis.
2. Cost/latency dashboard per-provider (dari 21 provider eksternal).
3. LLM-as-judge ringan (`Verifier` agent menilai KESEMPATAN LLM vs provider
   eksternal, hasilnya jadi sinyal training Fase 1).
4. API publik standar OpenAPI (rate limit, API key scoping).

---

## Bagian C — Quick Wins yang Masih Terbuka

Diambil dari roadmap asli, urutan dampak/effort realistis untuk solo dev:

1. **Quantization sebagai default** (Fase 1) — HP jadi lebih responsif tanpa
   kerja arsitektur baru, modul sudah ada tinggal diaktifkan.
2. **Feedback HITL → memory berbobot tinggi** (Fase 3) — bikin "auto-learning"
   di README benar-benar terasa, bukan cuma klaim.
3. **Tool-registry diperluas** (Fase 2) — dampak langsung ke kualitas semua
   agen sekaligus, fondasinya sudah ada.
4. **Agent-router berbasis confidence** (Fase 2) — mengurangi jawaban agen
   yang di luar konteks, salah satu keluhan paling umum di sistem multi-agent.

---

## Bagian D — Bagian B (Pipeline Teknis 100% Browser-Native): Status

`training-console/` **belum dibuat**. Ini pipeline besar (ekstraksi data →
distilasi sintetik → training SLM 49M → inference) yang didesain 100%
browser-native (File System Access API, WebGPU compute shader, Web Worker,
nol Python/backend). Detail teknis lengkap (kode WGSL matmul, training loop,
Transformers.js dual-runtime) ada di roadmap master asli — belum dieksekusi
karena skalanya besar (butuh beberapa sesi kerja terpisah, plus device dengan
`navigator.gpu` nyata untuk diuji, yang belum tersedia di sandbox
pengembangan saat ini). Ini realistis jadi proyek Fase 1 lanjutan setelah
quantization & tool-calling standar (Fase 2) matang lebih dulu — melatih
model custom baru sebelum orkestrasi agennya solid berisiko membuang kerja.

---

## Bagian E — Prinsip yang Tetap Berlaku

1. **Local-first, cloud-optional** — makin jarang butuh fallback ke provider
   eksternal, bukan makin jarang dipakai.
2. **Agent sebagai kontrak** — skema input/output terstruktur, bukan cuma
   teks bebas.
3. **Memory sebagai infrastruktur** — dipakai lintas modul, bukan silo.
4. **Observability sebelum otonomi ditambah** — sudah ada dashboard
   kesehatan sistem (Telemetry); pertahankan kebiasaan ini setiap menambah
   worker/agent baru.
5. **Setiap perubahan diverifikasi nyata** — Playwright regresi 25 halaman +
   unit test, bukan asumsi "harusnya jalan". Semua item "Selesai" di
   dokumen ini melewati verifikasi itu.
