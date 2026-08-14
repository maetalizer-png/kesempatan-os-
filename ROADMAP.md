# ROADMAP KESEMPATAN OS — v2 (Gabungan)

*Dokumen ini menggabungkan roadmap strategis awal (Fase 0-5) dengan hasil kerja nyata yang sudah dieksekusi dan diverifikasi di codebase. Statusnya bukan rencana di atas kertas — setiap item "Selesai" di bawah ini sudah diverifikasi lewat Playwright (regresi 25 halaman + unit test) dan sudah live di `main`.*

*Terakhir diperbarui: setelah Fase 2 (tool-registry diperluas, agent-to-agent evaluation loop, confidence-based agent routing, memory-bridge untuk KESWORKER) diimplementasi dan diverifikasi.*

### Item yang diminta tapi SENGAJA belum dikerjakan (tercatat, bukan terlewat)

| Item | Alasan ditunda |
|---|---|
| Modularisasi `reaction-learning.js` (1531 baris) | Beda dari threshold-learning.js yang punya batas modul jelas (const `Object.freeze` terpisah per engine), file ini ~30 fungsi top-level dengan shared state lebih implisit. Memecahnya tergesa-gesa berisiko regresi di kode yang sedang jalan. Sudah dipindah ke `features/monitoring/learning/reaction-learning.js` tanpa dipecah. |
| 3D Intelligence Sphere / Opportunity Radar / Score Trend jadi mode slide (carousel) | Perubahan UI/UX murni, belum disentuh. |
| Konsolidasi 57 tag `<script type="module">` di index.html jadi lebih sedikit entry point | Ini mengubah URUTAN EKSEKUSI boot seluruh app sekaligus (bukan satu fitur terisolasi) — kesalahan di sini berdampak ke SEMUA halaman, bukan satu fitur. Butuh sesi pengerjaan tersendiri dengan pengujian boot yang sangat teliti, bukan diselipkan di akhir sesi yang sudah panjang. |
| Perbaikan lanjutan delay awal aplikasi (skeleton shimmer sudah ditambahkan, tapi user melaporkan masih terasa) | Skeleton shimmer (commit sebelumnya) memperbaiki KESAN patah/kosong saat loading, tapi tidak mengatasi actual root cause kalau ternyata ada di sisi device pengguna (cache lama, jaringan). Butuh info lebih lanjut dari device nyata pengguna untuk didiagnosis lebih jauh — lihat catatan di bawah. |

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
  │     features/kestraktive/*.js (shell chat/forum/debat/turnamen) →
  │     features/kespremai/custom-auto/, features/kesworker/ai-worker.js →
  │     pages/pages.js → js/core/{ui-handlers,router}.js →
  │     ai-agent/agent-runtime.js → background.js (partikel 3D dekoratif)
  │
  └─► js/core/router.js aktif — sisanya (features/kespremai/{rap,voice,
        visual,podcast}, features/observation/, features/noise/,
        dataries/world.js, features/kesmarket/news/, features/publicapi/,
        features/kesmedia/editor/) di-import() ON-DEMAND cuma saat halaman
        sidebar terkait dibuka — bukan di boot.
```

**Container dashboard yang dipopulasi async tidak lagi tampak "kosong/
tumpang tindih" sesaat setelah first paint:** empat container utama
(`contenDasboardContainer`, `workflowModeContainer`, `agentControlContainer`,
`agentPoolContainer`) sekarang punya skeleton shimmer berbasis CSS `:empty`
selector — otomatis hilang begitu `renderUI()` mengisi kontennya, tanpa
perlu menyentuh 4 file render terpisah (`css/core/global.css`).

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
│   └── dashboard/                — widget dashboard utama (chart, hitl, export, metrics-panel,
│                                    time-analytics-panel, log-panel, report-panel/dock,
│                                    execute-panel, threshold, three-viz, conten-dasboard)
│                                    (semua file fitur sidebar SUDAH pindah ke features/ — lihat A.3)
│
├── css/                          — mengikuti nama folder js/ PERSIS
│   ├── core/                     — global, layout, sidebar, responsive, brand, checkbox, light-mode
│   ├── agent-runtime/            — agent-grid.css
│   └── dashboard/                — card-headings, charts, export-social, forms, hitl, log, metrics, toast
│
├── assets/
│   ├── svg/                      — logo-kesempatan, brand-logo, brand-subtitle
│   └── icons/                    — 9 ukuran icon PWA (72px-512px)
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
├── features/                      — SEMUA fitur sidebar (termasuk yang dulu di pages/),
│   │                                dikelompokkan PERSIS mengikuti struktur menu sidebar (lihat A.3)
│   ├── kestraktive/                — Chat AI, Chat Agent, Forum, Debat, Turnamen (34 file)
│   ├── kespremai/
│   │   ├── podcast/, voice/, rap/, visual/, custom-auto/, offline/
│   ├── kesmarket/
│   │   ├── live-crypto/, news/
│   ├── kesmedia/
│   │   ├── social-share/, theme/, editor/
│   ├── kesworker/                  — 55 AI Worker otonom (ai-worker.js dkk)
│   ├── monitoring/
│   │   ├── report/, telemetry/, learning/
│   │   │        learning/ berisi auto-learning.js (halaman UI) +
│   │   │        threshold-learning.js (dipecah jadi 6 modul di
│   │   │        learning/threshold/) + reaction-learning.js
│   ├── memory-manager/             — halaman UI Memory Manager (BUKAN memory/ engine di atas)
│   ├── settings/
│   └── observation/, noise/, websocket/, publicapi/
│                                    — tanpa submenu, langsung di features/
└── dev-simulator/                 — tool live-preview lokal (bukan bagian app produksi)
```

### A.3 `features/` — struktur, alasan, dan status self-containment

**Pemetaan folder ↔ menu sidebar** persis 1:1 — grup dengan submenu (▼)
jadi sub-folder `features/<grup>/<item>/`, item tanpa submenu langsung di
`features/<item>/`. Semua file fitur (termasuk yang tadinya lepas di `js/`
root dan `pages/`) sudah dipindah ke `features/` — lihat Bagian B untuk
detail modularisasi `threshold-learning.js` jadi 6 file di
`features/monitoring/learning/threshold/`.

**Analisis: apakah setiap fitur bisa punya CSS & HTML sendiri?**

Diperiksa langsung ke isi `kestraktive/`, `kespremai/`, `kesmarket/`,
`kesmedia/` sebelum menjawab:

- **CSS — sudah PADA DASARNYA self-contained, tanpa perlu dikerjakan lagi.**
  Fitur-fitur ini nyaris tidak memakai class dari `css/` bersama — mereka
  men-generate tampilannya sendiri lewat `element.style.cssText = '...'`
  langsung di JS (diverifikasi: nol match untuk nama fitur di seluruh
  `css/`, ratusan match untuk `.style.cssText` di file fitur). Artinya
  gaya visual tiap fitur SUDAH terikat erat ke kode fiturnya sendiri, bukan
  bergantung ke stylesheet global yang dipakai fitur lain. Membuat file
  `.css` terpisah per fitur di titik ini berarti MENGEKSTRAK ratusan
  `style.cssText` inline itu jadi class — refactor besar dengan risiko
  regresi visual nyata di banyak halaman, untuk manfaat yang murni
  organisasi (bukan kebutuhan fungsional), jadi TIDAK dikerjakan sesi ini.
- **HTML terpisah — tidak direkomendasikan tanpa perombakan arsitektur
  render yang jauh lebih besar.** Seluruh codebase (bukan cuma 4 fitur ini)
  merender UI lewat `container.innerHTML = '...template string...'` di
  JS, bukan file `.html` terpisah yang di-fetch. Memberi HANYA 4 fitur
  file `.html` sendiri akan jadi pengecualian yang tidak konsisten dengan
  55+ modul lain yang memakai pola sama — kalau pola ini mau diubah,
  seharusnya jadi keputusan arsitektur untuk SELURUH aplikasi, bukan
  4 fitur saja, dan itu di luar scope yang aman dikerjakan sekali jalan.

**Kesimpulan:** folder co-location (JS satu fitur = satu folder) — selesai
dan diverifikasi. Self-containment gaya CSS — sudah tercapai secara
alami lewat pola inline styling yang sudah ada, tidak perlu file `.css`
tambahan. HTML terpisah — bukan pekerjaan mekanis, butuh keputusan
arsitektur terpisah dan sengaja tidak diambil di sesi ini.

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

### ✅ Fase 2 — Orkestrasi Multi-Agent 2.0 (SELESAI, lingkup `ai-agent/`)

Fondasi `ai-agent/` (planner, orchestrator, tool-registry, result-evaluator,
provider-router) dibangun di sesi-sesi sebelumnya. Sesi ini melengkapi 4 item
yang tersisa:

1. **Tool-calling terstandar** — ✅ `ai-agent/tool-registry.js` diperluas
   dengan 7 kapabilitas baru: `export.toJSON/toHTML/toCSV/toPDF` (bungkus
   `ExportManager`), `theme.setTheme/getCurrentTheme` (bungkus
   `CustomTheme`), `voice.speak` (bungkus `AIVoiceAgents.speakWithAgentVoice`).
   Semua diverifikasi live lewat Playwright (invoke sungguhan, bukan cuma
   terdaftar).
2. **Agent-to-agent evaluation loop** — ✅ `result-evaluator.js` dapat
   `auditAgentOutput(output, { auditor, topic })`: agen auditor (default
   `Verifier`, bisa diganti mis. `RiskManager`) menilai wajar-tidaknya klaim
   skor/confidence agen lain lewat panggilan LLM sungguhan, tanpa mengulang
   analisis dari nol. `evaluateTaskWithAudit()` menjalankan audit untuk semua
   step yang menghasilkan output beragen, lalu menambah status `DISPUTED`
   (memicu re-plan) kalau ada yang tidak disetujui auditor. Diaktifkan lewat
   opsi `{ auditAgent: 'RiskManager' }` saat memanggil `runAgentTask()` —
   opt-in, tidak mengubah perilaku default. Diverifikasi live: panggilan
   audit sungguhan `StartupFounder` diaudit `RiskManager` menghasilkan
   `agrees: true, auditorConfidence: 73`.
3. **Dynamic agent routing berbasis confidence** — ✅ `provider-router.js`
   dapat `selectRelevantAgents(query, allAgents, limit)`: skor tiap agen
   analisis dari overlap kata kunci antara tugas pengguna dan nama/peran
   agen, rangking hasil, fallback ke urutan default kalau tidak ada yang
   cocok. `planner.js` memakai ini di `describeCapabilities(goal)` — daftar
   agen yang dikirim ke LLM planner sekarang relevan terhadap goal, bukan 13
   agen pertama secara statis. Diverifikasi: query "startup founder gagasan
   bisnis baru" → `StartupFounder` rank #1; "risiko hukum kontrak" →
   `Hukum` rank #1; "strategi pemasaran digital" → `Manager`/`Strategist`
   rank atas.
4. **Memory-bridge sebagai shared context** — ✅ Sisi agen analisis (55
   agen) sudah lama menulis+membaca `window.VectorMemory` langsung di
   `workflow.js` (RAG top-2 sebelum generate, save sesudah generate) — ini
   store yang sama persis dengan yang dibungkus `memory-bridge.js`, jadi
   sudah "shared" secara alami. Sisi KESWORKER (55 worker) TIDAK menulis ke
   memory sama sekali sebelum sesi ini (workernya menghasilkan string
   simulasi/sintetis, bukan LLM). Diperbaiki dengan menambah
   `MemoryBridge.save()` di tool `worker.run` (ai-agent/tool-registry.js),
   ditandai `source: 'worker'` supaya agen bisa membedakan konteks dari
   worker vs dari sesama agen analisis. Sengaja hanya di jalur orkestrasi
   `ai-agent/`, bukan di worker-pool otonom lama (`features/kesworker/`)
   supaya tidak ada risiko mencampur data acak/sintetis worker ke memori
   bersama lewat jalur yang tidak diminta.

Catatan lingkup: perluasan ini ada di layer `ai-agent/` (sistem orkestrasi
AI Agent baru). Dashboard multi-agent lama (`js/workflow/workflow.js`, 55
agen dengan checkbox manual) tidak disentuh — sudah teruji lama dan berjalan
di luar lingkup Fase 2 ini.

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
3. ~~**Tool-registry diperluas** (Fase 2)~~ — ✅ selesai (lihat Fase 2 di atas).
4. ~~**Agent-router berbasis confidence** (Fase 2)~~ — ✅ selesai (lihat Fase 2
   di atas).

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
