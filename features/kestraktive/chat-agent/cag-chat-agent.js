/* ============================================================
   interactive/chat-agent/cag-chat-agent.js (LAZY LOADER)
   MEMUAT SEMUA MODUL CHAT AGENT SECARA SEQUENTIAL
   cag-config.js → cag-state.js → cag-data-engine.js →
   cag-ui-render.js → cag-core.js
   Pola sama seperti workers/ai-worker.js, chat-ai/cai-chat-ai.js.

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveChatAgentPanel) — index.html sekarang cuma
   punya id kontainer kosong. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, ditimpa total oleh CAG_renderChatAgentPanel() di
   cag-core.js begitu modul terakhir selesai dimuat.
   ============================================================ */
// Placeholder-loading markup dihapus di sini — dengan ES module static
// import, seluruh graph (cag-config/state/data-engine/ui-render/core)
// diresolusi & dievaluasi SEBELUM baris apa pun di file ini sendiri
// berjalan, jadi CAG_initChatAgent() di cag-core.js sudah mengisi
// #interactiveChatAgentPanel begitu baris ini tercapai (lihat catatan
// yang sama di chat-ai/cai-chat-ai.js).
import './cag-config.js';
import './cag-state.js';
import './cag-data-engine.js';
import './cag-ui-render.js';
import './cag-core.js';
