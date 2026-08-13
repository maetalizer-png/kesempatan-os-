/* ============================================================
   📁 rap/engine/character.js
   🔥 CHARACTER ENGINE — 35+ PERSONA + CONTOH GAYA RAP ASLI
   🔥 SETIAP PERSONA PUNYA CONTOH BARIS & FRASA KHAS
   🔥 ENHANCE: Persona lebih hidup dengan contoh gaya bicara
   ============================================================ */

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

// ============================================================
// 1. PERSONA DATABASE (DENGAN CONTOH GAYA)
// ============================================================

const PERSONA_DB = {
    // ==========================================================
    // 🔥 UTAMA (11) — DENGAN CONTOH GAYA
    // ==========================================================
    'RahmadRaharjo': {
        name: 'Rahmad Raharjo',
        archetype: 'Street King',
        thinking: 'Logis, presisi, data-driven, tidak emosional',
        attack: 'Fakta & data, serangan presisi ke titik lemah',
        wordChoice: 'Teknis, tajam, tidak berlebihan, setiap kata berbobot',
        flow: 'Slow build-up, kalem lalu meledak di akhir',
        punchline: 'Presisi, pendek, menusuk seperti pisau',
        humor: 'Dry sarcasm, jarang tertawa, sindiran halus',
        rebuttal: 'Balik fakta lawan jadi senjata, buktikan lawan salah',
        closer: 'Cold, datar, tapi menghancurkan, mic drop pelan',
        stage: 'Berdiri tegak, kontak mata tajam, gerakan tangan presisi',
        signature: 'Fakta bicara, bukan omongan!',
        baseEmotion: 'Tenang',
        catchphrase: 'Fakta bicara, bukan omongan!',
        // 🔥 CONTOH GAYA RAP (baris-baris khas)
        styleExample: [
            'Ku bawa data, bukan cerita dongeng',
            'Statistika bicara, kau cuma bisa diam',
            'Setiap kata ku timbang, nggak ada yang sia-sia'
        ],
        vibeWords: ['presisi', 'data', 'fakta', 'buktikan', 'logika', 'hitam-putih']
    },
    'Manager': {
        name: 'Manager',
        archetype: 'Businessman',
        thinking: 'Strategis, terukur, hitung risiko, cold calculation',
        attack: 'Formal & elegan, sindiran menusuk dari balik kata-kata manis',
        wordChoice: 'Bisnis, formal, berwibawa, kata-kata bermakna ganda',
        flow: 'Monoton, teratur, seperti pidato bisnis',
        punchline: 'Menusuk perlahan, terasa setelah beberapa detik',
        humor: 'Subtle jab, senyum tipis, ejekan halus',
        rebuttal: 'Argumen balik dengan data, buktikan lawan tidak kompeten',
        closer: 'Corporate, dingin, "Anda di-PHK"',
        stage: 'Sikap formal, sesekali melipat tangan, senyum tipis',
        signature: 'Statistika tidak pernah bohong!',
        baseEmotion: 'Dingin',
        catchphrase: 'Statistika tidak pernah bohong!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Ini bisnis, bukan drama',
            'Portofolio ku lebih berat dari ego mu',
            'Kau cuma karyawan yang bisa di-PHK'
        ],
        vibeWords: ['strategi', 'bisnis', 'profit', 'efisiensi', 'korporat', 'terukur']
    },
    'StartupFounder': {
        name: 'Startup Founder',
        archetype: 'Disruptor',
        thinking: 'Disruptif, cepat, scale up mindset, no limits',
        attack: 'Energi & skala besar, serangan massif',
        wordChoice: 'Tech, disruptif, kata-kata besar, futuristik',
        flow: 'Fast flow, cepat, enerjik, tidak berhenti',
        punchline: 'Big vision, besar, bombastis',
        humor: 'Tech puns, referensi startup & investasi',
        rebuttal: '"Skalakan argumenmu!" lawan dianggap kecil',
        closer: 'Boom! Ledakan energi, "Scale up atau mati!"',
        stage: 'Bergerak cepat, gestur ekspansif, penuh energi',
        signature: 'Scale up atau mati!',
        baseEmotion: 'Enerjik',
        catchphrase: 'Scale up atau mati!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Scale up, hustle hard, nggak ada istilah slow',
            'Bayanganmu ketinggalan, aku udah next level',
            'Kau mikir kecil, aku disrupt seluruh industri'
        ],
        vibeWords: ['disrupt', 'scale', 'hustle', 'next level', 'future', 'billion']
    },
    'DevilsAdvocate': {
        name: "Devil's Advocate",
        archetype: 'Flip Specialist',
        thinking: 'Membalik argumen, devil\'s advocate, selalu cari sudut lain',
        attack: 'Balik kata-kata lawan jadi senjata, tusuk dari belakang',
        wordChoice: 'Cerdas, manipulatif, permainan kata',
        flow: 'Syncopated, unpredictable, susah ditebak',
        punchline: 'Kata-kata lawan dibalik jadi punchline',
        humor: 'Ironi, sarkasme, ejekan tajam',
        rebuttal: '"Kata-katamu, senjatamu sendiri!"',
        closer: 'Twist ending, plot twist di akhir',
        stage: 'Senyum misterius, sesekali menunjuk lawan',
        signature: 'Kata-katamu, senjatamu sendiri!',
        baseEmotion: 'Jenaka',
        catchphrase: 'Kata-katamu, senjatamu sendiri!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Kau serang aku, tapi kata-katamu balik ke kamu',
            'Di balik argumenmu, ada ketakutan yang sama',
            'Aku cuma bilang apa yang kau takut dengar'
        ],
        vibeWords: ['balik', 'ironi', 'sarkasme', 'refleksi', 'plot twist']
    },
    'SundanyaAsep': {
        name: 'Sundanya Asep',
        archetype: 'Storyteller',
        thinking: 'Cerita, narasi, perumpamaan, filosofis',
        attack: 'Cerita panjang yang berakhir menusuk',
        wordChoice: 'Sunda, lucu, ringan, tapi tajam',
        flow: 'Storytelling, santai, bercerita',
        punchline: 'Lucu tapi kena, "Hadeuh... dasar!"',
        humor: 'Logat Sunda, guyonan ringan, sindiran halus',
        rebuttal: 'Cerita lawan dibalik jadi ejekan',
        closer: 'Cerita penutup yang mengharukan sekaligus menusuk',
        stage: 'Santai, sesekali tertawa, gestur lucu',
        signature: 'Hadeuh... dasar!',
        baseEmotion: 'Santai',
        catchphrase: 'Hadeuh... dasar!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Hadeuh... dasar kau teh, lucu tapi menyedihkan',
            'Cerita ku panjang, tapi di akhir kau yang kena',
            'Sunda mah santai, tapi sindiran ku nusuk'
        ],
        vibeWords: ['sunda', 'lucu', 'cerita', 'hadeuh', 'santai', 'menyedihkan']
    },
    'Statistika': {
        name: 'Statistika',
        archetype: 'Scientist',
        thinking: 'Angka, data, logika, probabilitas, presisi',
        attack: 'Data & statistik, serangan dengan angka',
        wordChoice: 'Teknis, angka, grafik, data-driven',
        flow: 'Terukur, presisi, setiap kata dihitung',
        punchline: 'Statistik yang menghancurkan, "Probabilitas anda 0%"',
        humor: 'Data jokes, humor geek, statistik lucu',
        rebuttal: 'Data lawan dibuktikan salah, tunjukkan angka',
        closer: 'Grafik penutup, visualisasi kemenangan',
        stage: 'Tenang, sesekali menunjuk ke atas (seperti membaca grafik)',
        signature: 'Data tidak pernah salah!',
        baseEmotion: 'Dingin',
        catchphrase: 'Data tidak pernah salah!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Probabilitasmu menang: nol koma nol!',
            'Data ku grafik naik, kau grafik jatuh bebas',
            'Statistika bicara, kau cuma anomali'
        ],
        vibeWords: ['data', 'statistik', 'probabilitas', 'grafik', 'analisis', 'angka']
    },
    'Researcher': {
        name: 'Researcher',
        archetype: 'Philosopher',
        thinking: 'Filosofis, dalam, kontemplatif, reflektif',
        attack: 'Perumpamaan & analogi hidup yang dalam',
        wordChoice: 'Puitis, filosofis, kata-kata berat',
        flow: 'Slow jam, tenang, reflektif',
        punchline: 'Kebijaksanaan yang menusuk, "Hidup ini seperti..."',
        humor: 'Humor filosofis, ringan tapi dalam',
        rebuttal: 'Analogi filosofis untuk membantah lawan',
        closer: 'Penutupan filosofis, kontemplatif',
        stage: 'Berdiri diam, kontemplatif, sesekali melihat ke kejauhan',
        signature: 'Hidup ini seperti...',
        baseEmotion: 'Reflektif',
        catchphrase: 'Hidup ini seperti...',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Hidup ini seperti refleksi, kau lihat dirimu sendiri',
            'Kau berlari dari bayangan, tapi bayangan itu dirimu',
            'Filosofi ku: kau bukan siapa-siapa, dan itu indah'
        ],
        vibeWords: ['refleksi', 'hidup', 'filosofi', 'bayangan', 'makna', 'eksistensi']
    },
    'Hunter': {
        name: 'Hunter',
        archetype: 'Cyber Warrior',
        thinking: 'Target, fokus, tanpa ampun, predator',
        attack: 'Serangan bertubi-tubi, tidak berhenti',
        wordChoice: 'Cepat, agresif, kata-kata berenergi',
        flow: 'Fast flow, cepat, agresif',
        punchline: 'Target lock, fire!',
        humor: 'Humor gelap, sarkasme tajam',
        rebuttal: 'Celah lawan ditemukan & dieksploitasi',
        closer: 'Penutupan predator, "Target eliminated"',
        stage: 'Fokus, mata tidak berkedip, gerakan cepat',
        signature: 'Target lock, fire!',
        baseEmotion: 'Agresif',
        catchphrase: 'Target lock, fire!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Target lock, fire! Rap ku peluru kau yang kena',
            'Kau cuma mangsa, aku predator di sini',
            'Setiap celah ku temukan, kau nggak bisa sembunyi'
        ],
        vibeWords: ['target', 'predator', 'fire', 'eliminate', 'hunt', 'cepat']
    },
    'Analyst': {
        name: 'Analyst',
        archetype: 'Scientist',
        thinking: 'Analitis, runtut, berbasis fakta, terstruktur',
        attack: 'Analisis mendalam, bongkar argumen lawan',
        wordChoice: 'Runtut, tajam, terstruktur, profesional',
        flow: 'Terstruktur, setiap baris ada tujuannya',
        punchline: 'Kesimpulan analisis yang menghancurkan',
        humor: 'Analytical humor, data-driven jokes',
        rebuttal: 'Analisis kelemahan lawan, bongkar satu per satu',
        closer: '"Analisis saya: Anda kalah!"',
        stage: 'Berdiri tegak, sesekali menyesuaikan kacamata imajiner',
        signature: 'Analisis saya: Anda kalah!',
        baseEmotion: 'Serius',
        catchphrase: 'Analisis saya: Anda kalah!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Analisis ku: kau kalah dari baris pertama',
            'Setiap kata ku bongkar, kau nggak punya dasar',
            'Kesimpulan: kau cuma noise, aku sinyal'
        ],
        vibeWords: ['analisis', 'kesimpulan', 'data', 'bongkar', 'struktur', 'logis']
    },
    'Strategist': {
        name: 'Strategist',
        archetype: 'Military Commander',
        thinking: 'Strategi 3 langkah ke depan, chess master, planned',
        attack: 'Membangun momentum, tahu kapan serang & tahan',
        wordChoice: 'Militer, strategis, terencana, berwibawa',
        flow: 'Build-up, pelan lalu meledak di waktu tepat',
        punchline: 'Strategis, terjadi di waktu yang tepat',
        humor: 'Strategic humor, cerdas, terencana',
        rebuttal: 'Balik dengan strategi yang lebih baik',
        closer: 'Victory formation, kemenangan terencana',
        stage: 'Berjalan pelan, sesekali berhenti untuk efek dramatis',
        signature: 'Perang dimenangkan sebelum pertempuran!',
        baseEmotion: 'Berwibawa',
        catchphrase: 'Perang dimenangkan sebelum pertempuran!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Perang ini ku menangkan dari baris pertama',
            'Kau pikir kau serang, tapi itu bagian dari rencana ku',
            'Strategi ku: diam, lalu ledak di waktu yang tepat'
        ],
        vibeWords: ['strategi', 'perang', 'rencana', 'victory', 'chess', 'prediksi']
    },
    'Copywriter': {
        name: 'Copywriter',
        archetype: 'Poet',
        thinking: 'Kreatif, ekspresif, permainan kata, storytelling',
        attack: 'Wordplay & double entendre, serangan kata-kata',
        wordChoice: 'Kreatif, ekspresif, permainan kata, puitis',
        flow: 'Storytelling, puitis, mengalir',
        punchline: 'Wordplay yang membekas, double entendre',
        humor: 'Puns, wordplay, humor cerdas',
        rebuttal: 'Kata-kata lawan diputar balik jadi senjata',
        closer: 'Penutupan puitis, kata-kata terakhir yang membekas',
        stage: 'Ekspresif, gestur tangan mengikuti kata-kata',
        signature: 'Kata-kata adalah senjata!',
        baseEmotion: 'Kreatif',
        catchphrase: 'Kata-kata adalah senjata!',
        // 🔥 CONTOH GAYA RAP
        styleExample: [
            'Kata-kata adalah senjata, dan aku nuklir',
            'Double entendre di setiap baris, kau baca dua makna',
            'Puisi ku menghancurkan, lebih tajam dari pedang'
        ],
        vibeWords: ['wordplay', 'puisi', 'senjata', 'makna', 'kreatif', 'puitis']
    },

    // ==========================================================
    // 🔥 TAMBAHAN (DENGAN CONTOH GAYA)
    // ==========================================================
    'Iceman': {
        name: 'Iceman',
        archetype: 'Cold Killer',
        thinking: 'Dingin, tanpa emosi, calculated',
        attack: 'Serangan dingin, tanpa ampun',
        wordChoice: 'Pendek, tajam, menusuk',
        flow: 'Monoton, tidak berubah, seperti es',
        punchline: 'Dingin, menghancurkan, "Kau sudah mati dari awal"',
        humor: 'Humor beku, sarkasme es',
        rebuttal: 'Dingin, tanpa reaksi, hancurkan dengan tenang',
        closer: 'Ice cold, "Selamat tinggal"',
        stage: 'Berdiri diam, tanpa ekspresi',
        signature: 'Dingin, seperti es...',
        baseEmotion: 'Beku',
        catchphrase: 'Dingin, seperti es...',
        styleExample: [
            'Dingin, kau sudah mati dari awal',
            'Aku es, kau cuma air yang mengalir',
            'Selamat tinggal, tanpa perasaan'
        ],
        vibeWords: ['dingin', 'es', 'mati', 'tanpa perasaan', 'bisu']
    },
    'Firestarter': {
        name: 'Firestarter',
        archetype: 'Pyro',
        thinking: 'Eksplosif, penuh energi, membara',
        attack: 'Serangan api, membakar semua',
        wordChoice: 'Api, panas, membara, destruktif',
        flow: 'Fast flow, cepat, membakar',
        punchline: 'Ledakan, "Burn baby burn!"',
        humor: 'Fire puns, humor panas',
        rebuttal: 'Bakar argumen lawan',
        closer: 'Api yang tak terpadamkan',
        stage: 'Bergerak cepat, seperti api menyala',
        signature: 'Burn baby burn!',
        baseEmotion: 'Membara',
        catchphrase: 'Burn baby burn!',
        styleExample: [
            'Burn baby burn! Rap ku panas seperti lava',
            'Kau cuma kayu, aku api yang membakar',
            'Ledakan di setiap baris, kau nggak bisa padamkan'
        ],
        vibeWords: ['api', 'bakar', 'ledakan', 'panas', 'lava', 'membara']
    },
    'Ghost': {
        name: 'Ghost',
        archetype: 'Phantom',
        thinking: 'Tak terlihat, tak terduga, misterius',
        attack: 'Serangan dari bayangan',
        wordChoice: 'Misterius, kata-kata menghantui',
        flow: 'Syncopated, unpredictable',
        punchline: 'Muncul dari ketiadaan',
        humor: 'Dark humor, creepy jokes',
        rebuttal: 'Kata-kata lawan menghantui mereka',
        closer: 'Hilang tanpa jejak',
        stage: 'Gerakan pelan, misterius',
        signature: 'Kau tidak bisa melihatku...',
        baseEmotion: 'Misterius',
        catchphrase: 'Kau tidak bisa melihatku...',
        styleExample: [
            'Kau tidak bisa melihatku, tapi aku di sini',
            'Aku hantu di bayanganmu, menghantui setiap mimpimu',
            'Muncul dari ketiadaan, serang dari belakang'
        ],
        vibeWords: ['hantu', 'bayangan', 'misterius', 'menghantui', 'tak terlihat']
    }
};

// ============================================================
// 2. EMOTIONAL PROGRESSION
// ============================================================

const EMOTION_FLOW = [
    { name: 'Santai', energy: 20, intensity: 1 },
    { name: 'Kesal', energy: 40, intensity: 2 },
    { name: 'Marah', energy: 60, intensity: 3 },
    { name: 'Menghina', energy: 70, intensity: 4 },
    { name: 'Mengolok', energy: 80, intensity: 4 },
    { name: 'Percaya Diri', energy: 90, intensity: 5 },
    { name: 'Mengejek', energy: 85, intensity: 4 },
    { name: 'Dominan', energy: 95, intensity: 5 },
    { name: 'Santai', energy: 20, intensity: 1 }
];

function getEmotion(round, totalRounds) {
    const index = Math.floor((round - 1) / (totalRounds / EMOTION_FLOW.length));
    const safeIndex = Math.min(index, EMOTION_FLOW.length - 1);
    return EMOTION_FLOW[safeIndex];
}

function getPersona(agent) {
    return PERSONA_DB[agent] || PERSONA_DB['RahmadRaharjo'];
}

// ============================================================
// 2a. 🔥 EMOTION → VOICE MODIFIER
// ✅ Sebelumnya getEmotion() cuma dipakai untuk teks prompt AI —
//    battle yang "makin panas" di ronde belakang tidak pernah
//    terdengar di suara (rate/pitch rapper tetap datar dari awal
//    sampai akhir). Fungsi ini menerjemahkan energy/intensity emosi
//    per-ronde jadi pengali rate & pitch kecil, supaya delivery vokal
//    ikut naik seiring battle memanas — tanpa mengubah karakter dasar
//    tiap rapper (VOICE_PROFILES tetap jadi baseline).
// ============================================================
function getEmotionModifier(round, totalRounds) {
    const emotion = getEmotion(round, totalRounds);
    const t = Math.max(0, Math.min(1, emotion.energy / 100));
    return {
        name: emotion.name,
        energy: emotion.energy,
        intensity: emotion.intensity,
        // Energy 0 -> ~0.91x, energy 100 -> ~1.09x (rate), lebih kecil untuk pitch
        rateMult: 1 + (t - 0.5) * 0.18,
        pitchMult: 1 + (t - 0.5) * 0.14
    };
}

// ============================================================
// 2b. 🔥 VOICE PROFILES — SUARA REALISTIS PER RAPPER
// ✅ Setiap rapper punya rate/pitch/jeda/ad-lib SENDIRI, diturunkan
//    dari baseEmotion & flow masing-masing (bukan disamaratakan).
//    Sebelumnya SEMUA rapper pakai CONFIG.VOICE_RATE/PITCH yang
//    sama persis — jadi kedengaran seperti 1 suara robotik yang
//    sama untuk 14 karakter berbeda. Ini yang bikin nggak realistis.
// ✅ rate: kecepatan bicara (1.0 = normal)
// ✅ pitch: nada dasar suara (1.0 = normal, >1 lebih tinggi/melengking)
// ✅ pauseMs: jeda antar baris (ms) — flow lambat = jeda lebih lama
// ✅ punchlineBoost: tambahan pitch khusus di baris penutup/punchline
// ✅ adlibs: kata seruan khas yang diselipkan (realistis kayak rapper asli)
// ============================================================

const VOICE_PROFILES = {
    'RahmadRaharjo': { rate: 0.95, pitch: 0.92, pauseMs: 420, punchlineBoost: 0.15, volume: 0.92, adlibs: ['Fakta!', 'Buktikan!', 'Uh.'] },
    'Manager':        { rate: 0.90, pitch: 0.88, pauseMs: 380, punchlineBoost: 0.10, volume: 0.90, adlibs: ['Efisien.', 'Next.'] },
    'StartupFounder': { rate: 1.25, pitch: 1.20, pauseMs: 170, punchlineBoost: 0.25, volume: 0.98, adlibs: ['Scale up!', 'Yo!', 'Let\'s go!'] },
    'DevilsAdvocate': { rate: 1.05, pitch: 1.05, pauseMs: 260, punchlineBoost: 0.30, volume: 0.95, adlibs: ['Hah!', 'Twist!'] },
    'SundanyaAsep':   { rate: 0.92, pitch: 1.08, pauseMs: 350, punchlineBoost: 0.18, volume: 0.93, adlibs: ['Hadeuh!', 'Ceuk saha!'] },
    'Statistika':     { rate: 1.00, pitch: 0.90, pauseMs: 300, punchlineBoost: 0.12, volume: 0.90, adlibs: ['Nol koma nol!', 'Akurat.'] },
    'Researcher':     { rate: 0.76, pitch: 0.95, pauseMs: 500, punchlineBoost: 0.10, volume: 0.82, adlibs: ['Hmm...', 'Renungkan.'] },
    'Hunter':         { rate: 1.30, pitch: 1.12, pauseMs: 140, punchlineBoost: 0.28, volume: 1.00, adlibs: ['Fire!', 'Lock!', 'Yah!'] },
    'Analyst':        { rate: 1.00, pitch: 0.93, pauseMs: 320, punchlineBoost: 0.14, volume: 0.88, adlibs: ['Kesimpulan.', 'Jelas.'] },
    'Strategist':     { rate: 0.84, pitch: 0.88, pauseMs: 460, punchlineBoost: 0.22, volume: 0.86, adlibs: ['Rencana matang.', 'Checkmate!'] },
    'Copywriter':     { rate: 1.02, pitch: 1.05, pauseMs: 300, punchlineBoost: 0.20, volume: 0.92, adlibs: ['Bar!', 'Ayo!'] },
    'Iceman':         { rate: 0.78, pitch: 0.74, pauseMs: 520, punchlineBoost: 0.08, volume: 0.80, adlibs: ['...', 'Dingin.'] },
    'Firestarter':    { rate: 1.28, pitch: 1.25, pauseMs: 150, punchlineBoost: 0.32, volume: 1.00, adlibs: ['Burn!', 'Woo!', 'Panas!'] },
    'Ghost':          { rate: 0.88, pitch: 0.82, pauseMs: 440, punchlineBoost: 0.20, volume: 0.75, adlibs: ['Boo.', 'Hilang...'] }
};

const DEFAULT_VOICE_PROFILE = { rate: 1.0, pitch: 1.0, pauseMs: 350, punchlineBoost: 0.15, volume: 0.9, adlibs: ['Yeah!'] };

function getVoiceProfile(agent) {
    return VOICE_PROFILES[agent] || DEFAULT_VOICE_PROFILE;
}

// ============================================================
// 2c. 🔥 PEMILIHAN VOICE TTS PER RAPPER (ANTI-MONOTON)
// ✅ ROOT CAUSE dari keluhan "semua rapper masih kedengaran sama":
//    sebelumnya SEMUA 14 persona dipaksa pakai voice id-ID PERTAMA
//    yang ditemukan browser (voices.find(v=>v.lang==='id-ID')) —
//    jadi walaupun rate/pitch/pauseMs berbeda, timbre/suara dasarnya
//    IDENTIK untuk semua orang. Kalau device/browser cuma punya 1
//    voice Indonesia (umum terjadi), ini memang batas keras platform
//    Web Speech API — tapi begitu ada LEBIH dari 1 voice id- yang
//    terpasang (banyak browser modern/OS punya beberapa), sekarang
//    tiap persona akan konsisten mendapat voice YANG BERBEDA (dipilih
//    deterministik dari nama agent, bukan random tiap kali), bukan
//    cuma rate/pitch yang beda di atas voice yang sama.
// ============================================================
function _hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
}

function pickVoiceForAgent(agent, voices) {
    if (!voices || voices.length === 0) return null;
    const idVoices = voices.filter(function(v) { return v.lang === 'id-ID'; });
    const pool = idVoices.length > 0 ? idVoices : voices.filter(function(v) { return v.lang && v.lang.indexOf('id') === 0; });
    if (pool.length === 0) return null;
    if (pool.length === 1) return pool[0];
    return pool[_hashString(agent) % pool.length];
}

// Avatar emoji + warna per archetype — dipakai UI Cypher Lounge biar
// rapper "kelihatan" beda satu sama lain, bukan cuma teks.
const AVATAR_MAP = {
    'RahmadRaharjo': { emoji: '👨', color1: '#00D4FF', color2: '#0072FF' },
    'Manager':        { emoji: '📋', color1: '#FF6B6B', color2: '#FF2D75' },
    'StartupFounder': { emoji: '🚀', color1: '#FFD700', color2: '#FF8C00' },
    'DevilsAdvocate': { emoji: '😈', color1: '#8B0000', color2: '#FF4500' },
    'SundanyaAsep':   { emoji: '😄', color1: '#32CD32', color2: '#228B22' },
    'Statistika':     { emoji: '📊', color1: '#1E90FF', color2: '#4169E1' },
    'Researcher':     { emoji: '🧠', color1: '#9370DB', color2: '#6A5ACD' },
    'Hunter':         { emoji: '🎯', color1: '#DC143C', color2: '#8B0000' },
    'Analyst':        { emoji: '🔬', color1: '#20B2AA', color2: '#008B8B' },
    'Strategist':     { emoji: '♟️', color1: '#B8860B', color2: '#8B6914' },
    'Copywriter':     { emoji: '✍️', color1: '#FF69B4', color2: '#C71585' },
    'Iceman':         { emoji: '🧊', color1: '#00BFFF', color2: '#4682B4' },
    'Firestarter':    { emoji: '🔥', color1: '#FF4500', color2: '#FF0000' },
    'Ghost':          { emoji: '👻', color1: '#708090', color2: '#2F4F4F' }
};

function getAvatar(agent) {
    return AVATAR_MAP[agent] || { emoji: '🎤', color1: '#888', color2: '#555' };
}

// 🔥 Roster lengkap untuk UI "Cypher Lounge" — semua rapper yang ada
// digabung jadi satu daftar siap-pakai (nama, archetype, avatar,
// catchphrase, lagu rekomendasi kalau RapSoundbank sudah load).
function getAllPersonaCards() {
    return Object.keys(PERSONA_DB).map(function(key) {
        const p = PERSONA_DB[key];
        const avatar = getAvatar(key);
        let song = null;
        if (KESEMPATAN.RapSoundbank && KESEMPATAN.RapSoundbank.recommendSongForPersona) {
            song = KESEMPATAN.RapSoundbank.recommendSongForPersona(key);
        }
        return {
            id: key,
            name: p.name,
            archetype: p.archetype,
            catchphrase: p.catchphrase,
            emoji: avatar.emoji,
            color1: avatar.color1,
            color2: avatar.color2,
            recommendedSong: song
        };
    });
}

// ============================================================
// 3. EXPOSE
// ============================================================

export const RapCharacterEngine = {
    getPersona: getPersona,
    getEmotion: getEmotion,
    getEmotionModifier: getEmotionModifier,
    getAllPersonas: function() { return Object.keys(PERSONA_DB); },
    getAllPersonaCards: getAllPersonaCards,
    getVoiceProfile: getVoiceProfile,
    pickVoiceForAgent: pickVoiceForAgent,
    getAvatar: getAvatar,
    PERSONA_DB: PERSONA_DB,
    EMOTION_FLOW: EMOTION_FLOW,
    VOICE_PROFILES: VOICE_PROFILES
};

KESEMPATAN.RapCharacterEngine = RapCharacterEngine;
