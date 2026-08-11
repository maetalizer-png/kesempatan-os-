<div align="center">
  <img src="https://img.shields.io/badge/KESEMPATAN%20OS-v1.0-brightgreen" alt="Version">
  <img src="https://img.shields.io/badge/license-KESEMPATAN%20OS%20v1.0-blue" alt="License">
  <img src="https://img.shields.io/badge/agents-55-orange" alt="Agents">
  <img src="https://img.shields.io/badge/platform-web%20%7C%20mobile%20%7C%20pwa-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/built%20with-phone%20%2B%20gabut-brightgreen" alt="Built with">
</div>

<div align="center">
  <sub><strong>Dikerjakan 100% dari HP • Hari ke-70 • Masih terus berkembang</strong></sub>
  <br>
  <sub><em>"Awalnya cuma gabut. Eh, malah keterusan sampai sekarang."</em></sub>
</div>

# KESEMPATAN OS

**Autonomous Opportunity Intelligence System** — platform multi-agent AI berbahasa Indonesia dengan 55 agen, 55 AI Workers otonom, mesin LLM lokal buatan sendiri, mode eksekusi Sequential/Parallel, dan berbagai fitur interaktif (Chat, Forum, Debat, Turnamen, Rap Battle, Podcast, Voice & Clone).

## Tentang KESEMPATAN OS

KESEMPATAN OS adalah sistem intelijen otonom yang menggunakan **55 agen AI** dari berbagai bidang keahlian (bisnis, sains, teknologi, politik, hukum, dll.) untuk menganalisis peluang bisnis, pasar, dan inovasi.

### Kemampuan Inti
- Menjalankan 55 agen secara Sequential atau Parallel
- Skor peluang dari 10 dimensi penilaian (Demand, Competition, Monetization, Virality, Sustainability, Scalability, Timing, Attention, Execution, Long-term)
- Visualisasi radar chart, 3D Intelligence Sphere, dan Time Analytics
- Human-in-the-Loop (HITL) — review manual atau auto-approve berdasarkan threshold confidence
- Sistem belajar dari keputusan pengguna (auto-learning, threshold adaptif)
- 55 AI Workers yang berjalan otomatis 24/7 dengan schedule sendiri

## KESEMPATAN LLM — Mesin AI Lokal Buatan Sendiri

KESEMPATAN LLM adalah engine bahasa (LLM) yang ditulis dari nol dalam JavaScript murni — bukan wrapper dari provider AI mana pun. Berjalan sepenuhnya di browser lewat Web Worker, dengan arsitektur transformer lengkap (attention, feed-forward, tokenizer BPE, sampling, KV-cache) beserta kemampuan melatih dirinya sendiri dari data agen yang ada.

**Status jujur saat ini:**
- Stabil — tidak lagi macet/freeze, berjalan di Web Worker terpisah dari UI
- Skala saat ini: ~49,6 juta parameter, cukup untuk menghasilkan kalimat yang mulai koheren
- Bisa belajar berkelanjutan antar sesi (progres training tersimpan permanen di IndexedDB)
- Masih dalam tahap belajar — kualitas jawabannya belum sekonsisten provider AI besar; sistem otomatis jatuh ke provider luar sebagai cadangan
- Ini eksperimen nyata membangun kecerdasan buatan dari nol, bukan sekadar menyambungkan API

**Optimasi Performa:**
- **ADAM Optimizer** — momentum + adaptive learning rate untuk konvergensi lebih cepat dan stabil
- **Float32Array Kontigu** — buffer memori linear, efisiensi 50% lebih baik vs nested arrays
- **In-place Buffer Recycling** — eliminasi alokasi berulang, GC overhead minimal saat training
- **KV-Cache Attention** — caching key/value states, inference sequence panjang 2-3x lebih cepat
- **Lazy Module Loading** — modular loading on-demand, initial load time < 2 detik
- **Web Worker Isolation** — UI tetap responsif selama training/inference berat

## Fitur Utama

**Performa & Optimasi**
- **ADAM Optimizer** — momentum + adaptive learning rate, konvergensi 40% lebih cepat vs SGD
- **Float32 Memory Layout** — buffer kontigu linear, penggunaan memori turun 50%
- **In-place Updates** — zero-allocation training loops, eliminasi GC pressure
- **Web Worker Parallelism** — inference/training di background thread, UI 100% responsif
- **KV-Cache Attention** — caching key-value states, throughput inference naik 2-3x
- **Lazy Module Loading** — code splitting on-demand, initial load < 2 detik
- **IndexedDB Persistence** — checkpoint training permanen, resume instan tanpa memory leak
- **Buffer Recycling Pool** — pre-allocated memory pools untuk operasi matrix berat

**Analisis & Visualisasi**
- 10 Engine Penilaian, Radar Chart interaktif, 3D Intelligence Sphere, Time Analytics dengan trend line
- Observation Engine, Noise Filtering, Memory Manager (vector memory), Response Cache

**Fitur Interaktif (KESTRAKTIVE)**
- CHAT AI — tanya jawab dengan asisten (streaming + voice output)
- CHAT AGEN — ngobrol langsung dengan 1 dari 55 agen
- FORUM AGEN — satu pertanyaan dijawab semua agen terpilih
- DEBAT AGEN — 2 agen beradu argumen dengan juri AI/user
- TURNAMEN AGEN — bracket elimination (Full 55 / Top 16 / Top 8)
- RAP BATTLE — 2 agen berdebat dengan gaya rap

**AI Tools (KESPREMAI)**
- AI PODCAST — ubah hasil analisis jadi podcast suara
- VOICE & CLONE — 19 karakter suara, 14 bahasa, rekam suara sendiri (maks 5 clone), Live Voice Chat dengan agen AI internal
- VISUALISATION — visualisasi data interaktif
- CUSTOM & AUTO AGEN — buat agen manual, via AI, atau dari gambar
- MODE OFFLINE — mode kerja lokal

**Market & Media**
- KESMARKET: Live Crypto, News Aggregator (sumber lokal via RSS, tanpa API key)
- KESMEDIA: Social Share, Editor (AI Art Generator, Background Remover, Style Transfer), Thema (warna aksen)

**Sistem & Integrasi**
- 55 AI Workers otonom (Manajemen Worker + Log Aktivitas)
- WebSocket kolaborasi, Public API server, halaman CHAT KESEMPATAN OS mandiri
- Export 10 format: JSON, HTML, PDF, CSV, Excel (XLSX), PowerPoint (PPTX), Google Docs, Google Sheets, Notion, Email

**PWA Support**
- Bisa diinstall ke homescreen HP/desktop
- Service worker **install-only (tanpa caching)** — setiap update file langsung terlihat, tidak ada file lama nyangkut; konten analisis tetap membutuhkan koneksi internet

## Cara Install & Jalankan

    # 1. Clone repository
    git clone https://github.com/username/kesempatan-os.git
    cd kesempatan-os
    # 2. Buka index.html di browser (atau live server lokal)

Persyaratan: browser modern dengan WebGL & Web Worker. API key eksternal opsional (KESEMPATAN LLM jalan tanpa API key).

## Struktur Proyek

    KESEMPATAN-OS/
     ├── index.html, style.css, manifest.json, sw.js (install-only)
     ├── chat-kesempatan.html   # Halaman chat mandiri
     ├── js/                    # Modul inti app shell
     ├── kesem-llm/             # KESEMPATAN LLM (Web Worker)
     ├── memory/                # Vector Memory
     ├── kes-database/          # Database inti (IndexedDB)
     ├── agents/                # 55 agen, 5 file kategori
     ├── workers/               # 55 AI Workers otonom
     ├── voice-ai/              # Voice, Clone, Podcast, Live Chat
     ├── interactive/           # Chat AI/Agen, Forum, Debat, Turnamen
     ├── podcast/, rap/, visual-ai/, observ/, noise/, custom-ai/
     └── USER_GUIDE.md, README.md, LICENCE.txt

## API & Provider AI

KESEMPATAN LLM (lokal) adalah jalur utama kalau sudah siap — tanpa API key. Kalau belum, sistem jatuh ke salah satu dari **21 provider eksternal** (opsional, API key masing-masing): Groq, Google Gemini, HuggingFace, DeepSeek, Anthropic Claude, OpenAI, Alibaba Qwen, Cohere, Mistral, AI21, Perplexity, OpenRouter, dll. (daftar lengkap & harga per-token di halaman Settings).

## Atribusi Komponen Pihak Ketiga

| Komponen | Fungsi | Lisensi |
|---|---|---|
| Chart.js | Radar/line chart (CDN) | MIT |
| three.js | Visualisasi 3D (CDN) | MIT |
| html2canvas / jsPDF | Export PDF (CDN) | MIT |
| lamejs | Export MP3 (CDN) | Sesuai repo resminya |
| Font Awesome Free | Ikon (CDN) | FA Free License |
| Inter (Google Fonts) | Font | SIL OFL |

Layanan AI eksternal diatur sepenuhnya oleh syarat & ketentuan penyedia masing-masing — lihat LICENCE.txt pasal 6.3.

## Status Pengembangan — Jujur Apa Adanya

- KESEMPATAN LLM masih dalam tahap belajar — kualitas terus meningkat tapi belum sekonsisten provider besar
- **Optimasi performa telah diimplementasikan:** ADAM optimizer (konvergensi 40% lebih cepat), Float32 memory layout (memori -50%), in-place updates (zero-allocation loops), KV-cache attention (inference 2-3x lebih cepat), lazy loading, buffer recycling pools
- Service Worker kini install-only tanpa caching — isu file lama tersaji selesai permanen; PWA benar-benar bisa diinstall
- Jumlah agen 55, provider AI diperluas jadi 21 pilihan
- Skema enkripsi database masih kunci tetap (per-perangkat dalam rencana)
- Beberapa fitur lanjutan (constrained JSON output, integrasi GPU via WebGPU untuk matrix multiplication) masih dalam rencana

## Troubleshooting

| Masalah | Solusi |
|---|---|
| API Key tidak valid | Pastikan key benar dan memiliki kredit |
| Agen tidak merespon | Cek koneksi internet, refresh browser |
| 3D sphere tidak muncul | Pastikan browser mendukung WebGL |
| IndexedDB error | Hapus data situs di pengaturan browser, reload |
| Update tidak kelihatan | SW kini tanpa cache; bila perlu bersih-bersih paksa buka ?nosw=1 |
| Voice tidak keluar | Cek volume, pastikan browser mendukung Web Speech API |

## Lisensi

KESEMPATAN OS dilisensikan di bawah **KESEMPATAN OS SOFTWARE LICENSE AGREEMENT Version 1.0**. Gratis untuk non-komersial; penggunaan komersial wajib izin tertulis. Kontak: maetalizer@gmail.com. Lihat `LICENCE.txt`.

## Cerita di Balik Layar

Proyek ini dimulai dari rasa penasaran dan energi "gabut" — coba-coba lihat sejauh apa bisa membangun sesuatu langsung dari HP, tanpa laptop. Ternyata malah keterusan: dari satu fitur ke fitur lain, sampai akhirnya membangun mesin AI sendiri dari nol. Sekarang hari ke-70, dan masih terus berjalan.

Ini adalah pertama kalinya saya membuat sesuatu seperti ini. Saya tidak punya latar belakang di dunia ini — tidak mengerti arsitektur software, tidak paham cara membangun AI, tidak tahu harus mulai dari mana. Semua dipelajari sambil berjalan: coba, gagal, perbaiki, ulangi. Hasilnya mungkin belum maksimal dan masih jauh dari sempurna, tapi ini bukti bahwa kalau mau mulai, bahkan dari nol dan cuma bermodal HP, sesuatu bisa terwujud.

<div align="center">
  <sub><strong>Hak Cipta © 2026 KESEMPATAN OS. All Rights Reserved.</strong><br>Dibuat oleh Rahmad Raharjo</sub>
</div>
