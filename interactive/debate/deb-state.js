/* ============================================================
   interactive/debate/deb-state.js
   STATE BERSAMA DEBAT (independen dari modul chat lain)
   Diimpor oleh deb-voice-engine.js, deb-data-engine.js,
   deb-classes.js, deb-core.js — semuanya membaca/menulis field
   pada objek DEB_State yang sama (bukan variabel top-level
   terpisah lagi, karena ES module tidak membagi scope top-level
   antar file seperti classic script dulu).
   ============================================================ */
export const DEB_State = {
    speechEnabled: false,
    speechQueue: Promise.resolve(),
    queryCache: new Map()
};
