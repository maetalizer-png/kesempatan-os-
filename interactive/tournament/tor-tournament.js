/* ============================================================
   interactive/tournament/tor-tournament.js (LAZY LOADER)
   MEMUAT SEMUA MODUL TURNAMEN SECARA SEQUENTIAL
   tor-config.js → tor-state.js → tor-data-engine.js →
   tor-classes.js → tor-tournament-arena.js → tor-core.js
   ============================================================ */
// Placeholder-loading markup dihapus di sini — dengan ES module static
// import, seluruh graph (tor-config/state/data-engine/classes/
// tournament-arena/core) diresolusi & dievaluasi SEBELUM baris apa pun
// di file ini sendiri berjalan, jadi TRN_initTournamentUI() di
// tor-core.js sudah mengisi #interactiveTournamentPanel begitu baris
// ini tercapai (lihat catatan yang sama di chat-ai/cai-chat-ai.js).
import './tor-config.js';
import './tor-state.js';
import './tor-data-engine.js';
import './tor-classes.js';
import './tor-tournament-arena.js';
import './tor-core.js';
