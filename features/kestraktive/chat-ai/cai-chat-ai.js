/* ============================================================
   📁 interactive/chat-ai/cai-chat-ai.js (LAZY LOADER)
   🔥 MEMUAT SEMUA MODUL CHAT AI SECARA SEQUENTIAL
   🔥 Modularisasi total — setiap file punya satu tanggung jawab:
      cai-config.js       → konstanta & pola deteksi
      cai-state.js        → state bersama (independen dari chat lain)
      cai-data-engine.js  → integrasi World/Memory/Database, smart
                            search, deteksi sapaan/kabar, prompt, AI
      cai-ui-render.js    → suara, riwayat, tema, reaksi, render bubble
      cai-core.js         → kirim pesan, render panel, init, ekspor
                            window.ChatModule
   Pola sama seperti workers/ai-worker.js, memory.js, world.js.

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveChatAiPanel) — index.html sekarang cuma
   punya id kontainer kosong, konsisten dgn pola self-contained
   module lain di proyek ini. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, lalu ditimpa total oleh CAI_renderChatAiPanel() di
   cai-core.js begitu modul terakhir selesai dimuat & CAI_initChatAi()
   berjalan.
   ============================================================ */
// Placeholder-loading markup dihapus di sini — dengan ES module static
// import, seluruh graph (cai-config/state/data-engine/ui-render/core)
// diresolusi & dievaluasi SEBELUM baris apa pun di file ini sendiri
// berjalan (bukan bertahap lewat <script> yang di-append satu per satu
// seperti loader classic-script dulu). Artinya CAI_initChatAi() di
// cai-core.js — yang memanggil CAI_renderChatAiPanel() — SUDAH selesai
// mengisi #interactiveChatAiPanel dengan konten asli begitu baris ini
// tercapai; menimpa dengan placeholder di sini justru akan menutupi
// panel yang sudah jadi, bukan tampil sebelum modul dimuat.
import './cai-config.js';
import './cai-state.js';
import './cai-data-engine.js';
import './cai-ui-render.js';
import './cai-core.js';
