/* ============================================================
   interactive/forum/for-forum.js (LAZY LOADER)
   MEMUAT SEMUA MODUL FORUM SECARA SEQUENTIAL
   for-config.js → for-state.js → for-data-engine.js →
   for-ui-render.js → for-core.js

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveForumPanel) — index.html sekarang cuma
   punya id kontainer kosong. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, ditimpa total oleh FOR_renderForumPanel() di
   for-core.js begitu modul terakhir selesai dimuat.
   ============================================================ */
// Placeholder-loading markup dihapus di sini — dengan ES module static
// import, seluruh graph (for-config/state/data-engine/ui-render/core)
// diresolusi & dievaluasi SEBELUM baris apa pun di file ini sendiri
// berjalan, jadi FOR_initForum() di for-core.js sudah mengisi
// #interactiveForumPanel begitu baris ini tercapai (lihat catatan yang
// sama di chat-ai/cai-chat-ai.js).
import './for-config.js';
import './for-state.js';
import './for-data-engine.js';
import './for-ui-render.js';
import './for-core.js';
