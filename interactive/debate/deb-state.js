/* ============================================================
   interactive/debate/deb-state.js
   STATE BERSAMA DEBAT (independen dari modul chat lain)
   ============================================================ */
let DEB_speechEnabled = false;
let DEB_speechQueue = Promise.resolve();
let DEB_queryCache = new Map();
