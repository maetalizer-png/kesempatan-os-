# Panduan Pengguna KESEMPATAN OS v1.0

<div align="center">
  <sub><strong>Dibuat di HP • 70 hari • 100% energi "gabut"</strong></sub>
  <br>
  <sub><em>"Udah jadi. Tapi saya tambah fitur terus. Gak bisa berhenti."</em></sub>
</div>

**Autonomous Opportunity Intelligence System**

55 Multi-Agent AI | 55 AI Workers | Chat | Forum | Debat | Turnamen | Rap Battle | Podcast | Voice Clone | Export 10 Format

---

## Memulai

### Persyaratan

- **Browser:** Chrome, Firefox, Edge, atau Safari versi terbaru (support WebGL untuk 3D)
- **API Key:** tidak wajib — KESEMPATAN LLM (mesin AI lokal) jalan langsung di browser tanpa API key. API key provider eksternal sifatnya opsional (cadangan), dan hanya bisa dimasukkan melalui menu **Settings**.

### Install sebagai Aplikasi (PWA)

- **Android (Chrome):** menu titik tiga → "Instal aplikasi" / "Tambahkan ke layar Utama"
- **Desktop (Chrome/Edge):** ikon instal di address bar → "Instal KESEMPATAN OS"
- **iPhone/iPad (Safari):** tombol Share → "Tambah ke Layar Utama"

Setelah terinstall, aplikasi dibuka langsung dari homescreen. Konten analisis tetap membutuhkan koneksi internet.

### Langkah Awal

1. Buka `index.html` di browser (atau aplikasi yang sudah diinstall).
2. **(Opsional)** Masukkan API Key provider eksternal di menu **Settings** → Konfigurasi AI.
3. Pilih **Autonomy Mode:** Observe / Plan (default, review manual) / Act (auto-agregasi).
4. Kembali ke **KESBOARD** untuk mulai analisis.

### Mode Eksekusi

| Mode | Kecepatan | Keterangan |
|---|---|---|
| Sequential | Standard | Agen satu per satu |
| Parallel | 3–10x lebih cepat | Aktifkan di menu KESPREMAI → Mode Paralel |

---

## Navigasi (Sidebar)

| Menu | Isi |
|---|---|
| KESBOARD | Dashboard utama analisis |
| Observation Engine / Noise Filtering | Pemantauan & pembersihan sinyal |
| Memory Manager / Response Cache | Memori vektor & cache respons |
| Monitoring | Report, Telemetry, Auto-Learning |
| Settings | Provider AI, API Key, Cloud Sync, Telemetry, Info Sistem, Thema |
| KESWORKER (55) | Manajemen Worker, Log Aktivitas |
| KESTRAKTIVE | Chat AI, Chat Agen, Forum, Debat, Turnamen, Rap Battle |
| KESPREMAI | Podcast, Voice & Clone, Rap Battle, Visualisation, Custom & Auto Agen, Mode Offline |
| KESMARKET | Live Crypto, News Aggregator |
| KESMEDIA | Social Share, Thema, Editor |
| WebSocket / Public API | Kolaborasi tim & integrasi |
| CHAT KESEMPATAN OS | Halaman chat mandiri (file terpisah) |

---

## Dashboard & Input Parameter

| Komponen | Fungsi |
|---|---|
| Topik | Judul peluang yang dianalisis |
| Instruksi | Panduan analisis lebih detail |
| Upload File | Data pendukung (CSV/JSON/TXT, maks 10MB) |
| START ENGINE | Memulai analisis dengan agen terpilih |
| Tab Kategori | BISNIS, SAINS & TEKNO, UMUM, POLITIK, GLOBAL, CUSTOM |
| Log Eksekusi | Hasil setiap agen real-time |
| Timer & Progress | Durasi + estimasi waktu selesai |

> **Catatan:** Input API key tidak tersedia di dashboard. Semua konfigurasi API key dilakukan melalui menu **Settings** → Konfigurasi AI.

### Memilih Agen

Terdapat 55 agen dalam beberapa kategori (tab). Klik tab, centang agen, atau pakai **Pilih Semua** / **Batal Pilih**. Semakin banyak agen = analisis lebih komprehensif tapi lebih lama; gunakan Mode Paralel untuk mempercepat.

### Agen Special

| Agen | Karakter | Gaya Bicara |
|---|---|---|
| Rahmad Raharjo | Senior Business Advisor | Bijak, santai, panggil "Bos" |
| Sundanya Asep | Pengusaha Sunda | Lucu, logat sunda, "Aduuh aduuh" |
| Devils Advocate | Kritikus | Skeptis, suka nantang asumsi |

---

## AI Workers (55 Autonomous AI)

55 AI yang bekerja otomatis 24/7 tanpa perintah. Klik **KESWORKER (55)** → Manajemen Worker, aktifkan toggle, pilih schedule (Realtime/Hourly/Daily/Weekly), klik **Run** untuk manual, pantau di Log Aktivitas.

---

## KESEMPATAN LLM — Mesin AI Lokal

Mesin bahasa buatan sendiri yang berjalan di HP Anda tanpa API key. Kalau siap, dia jadi jalur utama; kalau belum, sistem otomatis pakai provider eksternal. Progres belajar tersimpan permanen; kualitas masih terus dilatih (model kecil) — ini bagian eksperimental untuk kemandirian penuh di masa depan.

---

## Human-in-the-Loop (HITL)

Mode **Plan** menampilkan panel HITL setelah eksekusi: **Approve / Reject / Edit Skor / Proses Agregasi Final**. Sistem belajar dari keputusan Anda (Auto-Learning).

---

## Fitur Interaktif (KESTRAKTIVE)

- **Chat AI** — streaming response + voice output.
- **Chat Agen** — pilih 1 dari 55 agen, jawaban sesuai peran + suara unik.
- **Forum Agen** — satu pertanyaan dijawab semua agen terpilih; bisa dihentikan kapan saja.
- **Debat Agen** — 2 agen berdebat, pilih ronde & moderator, opsi voice.
- **Turnamen Agen** — bracket elimination (Full 55 / Top 16 / Top 8), mode Cepat/Best of 3.
- **Rap Battle** — 2 agen rap battle dengan topik & ronde pilihan.

---

## AI Tools (KESPREMAI)

- **AI Podcast** — hasil analisis jadi podcast; pilih karakter suara & kecepatan; download naskah.
- **Voice & Clone** — 19 karakter suara (Profesional, Santai, Energik, Bijak, Lucu, Robot, Tua, Anak, Misterius, Antusias, Tenang, Berwibawa, Berbisik, Dalam, Tinggi, Santa, Chipmunk, Demon, Angel); 14 bahasa; rekam suara 10 detik, simpan (maks 5), agen bicara dengan suara Anda; Live Voice Chat dengan agen AI internal (Rahmad Raharjo, Manager, StartupFounder, DevilsAdvocate, Sundanya Asep).
- **Visualisation** — visualisasi data interaktif.
- **Custom & Auto Agen** — buat agen manual, via AI dari deskripsi, atau dari gambar.
- **Mode Offline** — mode kerja lokal.

---

## Editor (KESMEDIA)

- **AI Art Generator** — gambar dari teks via Pollinations.ai (gratis, tanpa API key).
- **Background Remover** — hapus background (API key remove.bg gratis).
- **Style Transfer** — ubah gaya gambar (API key DeepAI gratis).

---

## Market & Media

- **Live Crypto** — harga kripto real-time.
- **News Aggregator** — berita lokal (RSS, tanpa API key) & internasional (GNews opsional).
- **Social Share** — bagikan laporan ke media sosial.

---

## Memahami Hasil Analisis

**10 Engine Penilaian:** Demand, Competition, Monetization, Virality, Sustainability, Scalability, Timing, Attention, Execution, Long-term.

| Skor | Prioritas | Rekomendasi |
|---|---|---|
| ≥85 | HIGH | Prioritas utama |
| 70–84 | MEDIUM | Layak dipertimbangkan |
| 50–69 | LOW | Perlu riset lanjutan |
| <50 | POOR | Hindari |

**Visual:** Radar Chart, 3D Intelligence Sphere (drag untuk rotasi), Time Analytics (trend line, klik titik untuk detail).

---

## Export Laporan

10 format: JSON, HTML, PDF, CSV, Excel, PPTX, Google Docs, Google Sheets, Notion, Email.

---

## Kolaborasi & Public API

- **WebSocket Server:** `npm run websocket` (`ws://localhost:3000`)
- **Public API Server:** `npm run api` (`http://localhost:3456`)
- **Endpoints:** `/health`, `/agents`, `/workers`, `/analyze`, `/report/latest`, `/reports`, `/report/:id`, `/keys/generate`, `/keys`, `/keys/:key`

---

## Pengaturan Sistem

- **Konfigurasi AI** — pilih provider dari 21 pilihan + masukkan API key di sini (satu-satunya tempat input API key).
- **Cloud Sync** — Supabase.
- **Telemetry** — pemantauan performa sistem.
- **Info Sistem** — detail teknis.
- **Thema** — warna aksen: Hijau neon (default), Neon Pink, Sunset, Ocean, Forest, Royal, Blood.

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| API Key tidak valid | Pastikan key benar & punya kredit; cek di menu Settings |
| Agen tidak merespon | Cek koneksi, refresh browser |
| 3D sphere tidak muncul | Pastikan browser support WebGL |
| IndexedDB error | Hapus data situs, reload |
| Turnamen lama | Mode "Cepat" / Mode Paralel |
| Voice tidak keluar | Cek volume & dukungan Web Speech API |
| Voice clone gagal | Izinkan akses mikrofon |
| News aggregator error | GNews opsional; sumber lokal tetap jalan |

---

## Tentang Pembuat

Dibuat oleh **Rahmad Raharjo**, pengembang tunggal, dikerjakan 100% dari layar HP — 70 hari sejak dimulai, masih terus berkembang. Awalnya iseng gabut; ternyata keterusan sampai membangun mesin AI (KESEMPATAN LLM) sendiri dari nol.

Ini adalah pertama kalinya saya membuat sesuatu seperti ini. Saya tidak punya latar belakang di dunia ini — tidak mengerti arsitektur software, tidak paham cara membangun AI, tidak tahu harus mulai dari mana. Semua dipelajari sambil berjalan: coba, gagal, perbaiki, ulangi. Hasilnya mungkin belum maksimal dan masih jauh dari sempurna, tapi ini bukti bahwa kalau mau mulai, bahkan dari nol dan cuma bermodal HP, sesuatu bisa terwujud.

---

## Lisensi

KESEMPATAN OS dilisensikan di bawah **KESEMPATAN OS SOFTWARE LICENSE AGREEMENT Version 1.0**. Non-komersial gratis; komersial wajib izin tertulis. Kontak: maetalizer@gmail.com | WhatsApp 08816998654. Lihat `LICENCE.txt`.

---

<div align="center">
  <sub><strong>Hak Cipta © 2026 KESEMPATAN OS. All Rights Reserved.</strong></sub>
  <br>
  <sub>Pembuat: Rahmad Raharjo</sub>
</div>