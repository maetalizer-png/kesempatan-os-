/* ============================================================
   interactive/debate/deb-voice-engine.js
   MESIN SUARA DEBAT — antrean ucapan, profil suara per-agen,
   pemecahan kalimat & jeda alami (lihat KESEMPATAN_OS_REORG_NOTES.md
   ronde ke-9 untuk detail perbaikan bug suara).
   ============================================================ */
    // ============================================================
    // MESIN SUARA DEBAT — diperbaiki total.
    // Masalah lama: setiap panggilan DEB_speakText() langsung
    // window.speechSynthesis.cancel() tanpa menunggu ucapan
    // sebelumnya selesai → kalimat lawan bicara terpotong di
    // tengah kata. Ditambah teks dipotong paksa .substring(0,500)
    // SEBELUM sampai sini, dan satu suara/pitch/rate yang sama
    // dipakai untuk kedua agen → terdengar datar & identik.
    //
    // Perbaikan:
    // 1. Antrean (queue) — ucapan baru menunggu ucapan sebelumnya
    //    benar-benar selesai, tidak saling memotong.
    // 2. Setiap agen dapat "profil suara" sendiri (pitch/rate/
    //    pilihan voice Indonesia yang berbeda kalau tersedia lebih
    //    dari satu) — konsisten per agen berdasarkan nama, supaya
    //    Agen A selalu terdengar beda dari Agen B sepanjang debat.
    // 3. Teks dipecah per kalimat & diberi jeda alami antar kalimat
    //    (bukan satu blok panjang datar), dan TIDAK dipotong paksa —
    //    argumen lengkap sampai selesai.
    // ============================================================
    function DEB_hashAgentKey(key) {
        let hash = 0;
        const str = String(key || '');
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        }
        return hash;
    }

    function DEB_getVoiceProfile(agentKey) {
        // Dua profil kontras: satu lebih rendah & tenang, satu lebih
        // tinggi & cepat — supaya dua agen yang bicara bergantian
        // benar-benar terasa seperti dua orang berbeda, bukan gema
        // dari suara yang sama.
        const PROFILES = [
            { pitch: 0.82, rate: 0.93, voiceIndex: 0 },
            { pitch: 1.22, rate: 1.05, voiceIndex: 1 }
        ];
        if (!agentKey) {
            return { pitch: 1.0, rate: DEB_CONFIG.VOICE_RATE, voiceIndex: 0 };
        }
        return PROFILES[DEB_hashAgentKey(agentKey) % 2];
    }

    function DEB_getIndonesianVoices() {
        const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
        const idVoices = voices.filter(function(v) {
            return v.lang === 'id-ID' || v.lang.indexOf('id') === 0;
        });
        return idVoices.length > 0 ? idVoices : voices;
    }

    function DEB_splitIntoSentences(text) {
        const parts = text.match(/[^.!?]+[.!?]*/g);
        if (!parts || parts.length === 0) {
            return [text];
        }
        return parts.map(function(s) { return s.trim(); }).filter(Boolean);
    }

    function DEB_speakUtteranceChain(text, profile) {
        return new Promise(function(resolve) {
            if (!window.speechSynthesis) {
                resolve();
                return;
            }
            const sentences = DEB_splitIntoSentences(text);
            const idVoices = DEB_getIndonesianVoices();
            const chosenVoice = idVoices.length > 0 ? idVoices[profile.voiceIndex % idVoices.length] : null;
            let i = 0;

            function speakNext() {
                if (i >= sentences.length) {
                    resolve();
                    return;
                }
                const utterance = new SpeechSynthesisUtterance(sentences[i]);
                utterance.lang = 'id-ID';
                utterance.rate = profile.rate;
                utterance.pitch = profile.pitch;
                if (chosenVoice) {
                    utterance.voice = chosenVoice;
                }
                utterance.onend = function() {
                    i++;
                    setTimeout(speakNext, 130); // jeda alami antar kalimat
                };
                utterance.onerror = function() {
                    i++;
                    speakNext();
                };
                window.speechSynthesis.speak(utterance);
            }
            speakNext();
        });
    }

    function DEB_speakText(text, agentKey) {
        if (!DEB_speechEnabled || !text || text.length === 0) {
            return Promise.resolve();
        }
        // FIX (laporan user: kata "asterisk asterisk" terdengar diucapkan
        // mesin TTS saat debat berjalan) — sebelumnya cleanText di sini
        // cuma buang tag HTML+&nbsp;, TIDAK membuang sintaks markdown
        // (**tebal**, *miring*, dst) yang sering muncul di argumen AI.
        // Browser membacakan tanda "*" secara harfiah sebagai kata
        // "asterisk" — makin sering AI menebalkan kata, makin sering
        // kedengaran berulang. addMessage()/showResult() di debate-arena.js
        // SUDAH benar pakai DEB_SecurityManager.stripMarkdown() utk
        // TAMPILAN teks, tapi jalur SUARA ini terlewat. Dibersihkan di
        // sini juga, pakai fungsi yang SAMA PERSIS (satu sumber kebenaran,
        // bukan regex duplikat) — classes.js (yang mendefinisikan
        // DEB_SecurityManager) sudah pasti termuat duluan di titik INI
        // dipanggil (baru jalan saat user klik "Mulai Debat", jauh
        // setelah seluruh rantai modul selesai dimuat).
        const stripped = (typeof DEB_SecurityManager !== 'undefined' && DEB_SecurityManager.stripMarkdown)
            ? DEB_SecurityManager.stripMarkdown(text)
            : text;
        const cleanText = stripped.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (!cleanText) {
            return Promise.resolve();
        }
        const profile = DEB_getVoiceProfile(agentKey);
        // Antre di belakang ucapan sebelumnya — tidak lagi memotongnya.
        DEB_speechQueue = DEB_speechQueue.then(function() {
            return DEB_speakUtteranceChain(cleanText, profile);
        }).catch(function() {
            return Promise.resolve();
        });
        return DEB_speechQueue;
    }

    function DEB_stopAllSpeech() {
        DEB_speechQueue = Promise.resolve();
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    // ============================================================
    // 3. CACHE SYSTEM
    // ============================================================
