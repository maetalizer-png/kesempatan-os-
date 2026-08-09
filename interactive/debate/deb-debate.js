/* ============================================================
   interactive/debate/deb-debate.js (LAZY LOADER)
   MEMUAT SEMUA MODUL DEBAT SECARA SEQUENTIAL
   deb-config.js → deb-state.js → deb-voice-engine.js →
   deb-data-engine.js → deb-classes.js → deb-debate-arena.js →
   deb-core.js

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveDebatePanel) — index.html sekarang cuma
   punya id kontainer kosong. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, ditimpa total oleh DEB_renderDebatePanel() di
   deb-core.js begitu modul terakhir selesai dimuat.
   ============================================================ */
// Placeholder-loading markup dihapus di sini — dengan ES module static
// import, seluruh graph (deb-config/state/voice-engine/data-engine/
// classes/debate-arena/core) diresolusi & dievaluasi SEBELUM baris apa
// pun di file ini sendiri berjalan, jadi DEB_initDebateUI() di
// deb-core.js sudah mengisi #interactiveDebatePanel begitu baris ini
// tercapai (lihat catatan yang sama di chat-ai/cai-chat-ai.js).
import './deb-config.js';
import './deb-state.js';
import './deb-voice-engine.js';
import './deb-data-engine.js';
import './deb-classes.js';
import './deb-debate-arena.js';
import './deb-core.js';
