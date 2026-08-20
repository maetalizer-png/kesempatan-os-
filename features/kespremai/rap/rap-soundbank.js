

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;




const SONGS = [
    
    { id: 'trap-01', title: 'Malam Ibukota', genre: 'trap', bpm: 145, mood: 'gelap-agresif', hook: 'Lampu kota nyala, aku yang berkuasa!' },
    { id: 'trap-02', title: 'Data & Darah', genre: 'trap', bpm: 150, mood: 'dingin-presisi', hook: 'Angka jadi senjata, kau kalah sebelum mulai!' },
    { id: 'trap-03', title: 'Scale Up', genre: 'trap', bpm: 160, mood: 'enerjik-ambisius', hook: 'Dari nol ke sejuta, kau masih di garis start!' },
    { id: 'trap-04', title: 'Korporat Kejam', genre: 'trap', bpm: 138, mood: 'formal-menusuk', hook: 'Rapat ku menang, kau cuma notulen!' },
    { id: 'trap-05', title: 'Api Panggung', genre: 'trap', bpm: 155, mood: 'membara', hook: 'Burn baby burn, panggung ini milikku!' },
    { id: 'trap-06', title: 'Target Terkunci', genre: 'trap', bpm: 148, mood: 'predator', hook: 'Target lock, fire, kau nggak ada tempat sembunyi!' },
    { id: 'trap-07', title: 'Twist Akhir', genre: 'trap', bpm: 142, mood: 'licik-cerdas', hook: 'Kata-katamu, senjata balik ke kamu sendiri!' },
    { id: 'trap-08', title: 'Mic Drop Dingin', genre: 'trap', bpm: 140, mood: 'beku', hook: 'Kau sudah mati dari baris pertama...' },

    
    { id: 'boom-01', title: 'Jalanan Lama', genre: 'boom-bap', bpm: 92, mood: 'klasik-santai', hook: 'Dari jalanan ke panggung, cerita ku nggak pernah bohong' },
    { id: 'boom-02', title: 'Filosofi Senja', genre: 'boom-bap', bpm: 86, mood: 'reflektif', hook: 'Hidup ini seperti bayangan yang kau kejar sendiri' },
    { id: 'boom-03', title: 'Warung Kopi Sunda', genre: 'boom-bap', bpm: 90, mood: 'santai-lucu', hook: 'Hadeuh... dasar, tapi sindiran ku nusuk' },
    { id: 'boom-04', title: 'Papan Catur', genre: 'boom-bap', bpm: 88, mood: 'berwibawa', hook: 'Perang ku menang sebelum kau sadar sudah kalah' },
    { id: 'boom-05', title: 'Kata Adalah Senjata', genre: 'boom-bap', bpm: 94, mood: 'puitis', hook: 'Puisi ku menghancurkan, lebih tajam dari pedang' },
    { id: 'boom-06', title: 'Kesimpulan Akhir', genre: 'boom-bap', bpm: 90, mood: 'analitis', hook: 'Kesimpulan: kau cuma noise, aku sinyal' },
    { id: 'boom-07', title: 'Bayangan Kota', genre: 'boom-bap', bpm: 84, mood: 'misterius', hook: 'Kau tidak bisa melihatku, tapi aku selalu di sini' },
    { id: 'boom-08', title: 'Grafik Kemenangan', genre: 'boom-bap', bpm: 96, mood: 'presisi', hook: 'Data ku grafik naik, kau grafik jatuh bebas' },

    
    { id: 'drill-01', title: 'Serangan Fajar', genre: 'drill', bpm: 142, mood: 'agresif-cepat', hook: 'Fokus, mata nggak berkedip, target eliminated!' },
    { id: 'drill-02', title: 'Ledakan Startup', genre: 'drill', bpm: 150, mood: 'meledak-ledak', hook: 'Scale up atau mati, nggak ada plan B!' },
    { id: 'drill-03', title: 'Statistik Berdarah', genre: 'drill', bpm: 146, mood: 'tajam-dingin', hook: 'Probabilitasmu menang: nol koma nol!' },
    { id: 'drill-04', title: 'Es dan Baja', genre: 'drill', bpm: 138, mood: 'beku-keras', hook: 'Aku es, kau cuma air yang mengalir' },
    { id: 'drill-05', title: 'Rima Berbahaya', genre: 'drill', bpm: 144, mood: 'teknikal-cepat', hook: 'Double entendre di setiap baris, kau baca dua makna' },
    { id: 'drill-06', title: 'Hantu Panggung', genre: 'drill', bpm: 140, mood: 'menghantui', hook: 'Aku hantu di bayanganmu, menghantui setiap mimpimu' },
    { id: 'drill-07', title: 'Analisis Mematikan', genre: 'drill', bpm: 143, mood: 'terstruktur-keras', hook: 'Setiap kata ku bongkar, kau nggak punya dasar' },
    { id: 'drill-08', title: 'Strategi Terakhir', genre: 'drill', bpm: 141, mood: 'terencana-tegas', hook: 'Strategi ku: diam, lalu ledak di waktu yang tepat' }
];




const PERSONA_SONG_MAP = {
    'Kesempatan': ['trap-02', 'boom-08', 'drill-03'],
    'Manager': ['trap-04', 'boom-04', 'drill-08'],
    'StartupFounder': ['trap-03', 'drill-02'],
    'DevilsAdvocate': ['trap-07', 'drill-05'],
    'SundanyaAsep': ['boom-03', 'boom-01'],
    'Statistika': ['trap-02', 'drill-03', 'boom-08'],
    'Researcher': ['boom-02', 'boom-07'],
    'Hunter': ['drill-01', 'trap-06'],
    'Analyst': ['boom-06', 'drill-07'],
    'Strategist': ['boom-04', 'drill-08'],
    'Copywriter': ['boom-05', 'drill-05'],
    'Iceman': ['trap-08', 'drill-04'],
    'Firestarter': ['trap-05', 'drill-02'],
    'Ghost': ['boom-07', 'drill-06']
};

function getAllSongs() {
    return SONGS.slice();
}

function getSongById(id) {
    return SONGS.find(function(s) { return s.id === id; }) || null;
}

function getSongsByGenre(genre) {
    return SONGS.filter(function(s) { return s.genre === genre; });
}




function recommendSongForPersona(agent) {
    const mapped = PERSONA_SONG_MAP[agent];
    if (mapped && mapped.length > 0) {
        const id = mapped[Math.floor(Math.random() * mapped.length)];
        return getSongById(id);
    }
    return SONGS[Math.floor(Math.random() * SONGS.length)];
}

function getDefaultSongForGenre(genre) {
    const list = getSongsByGenre(genre);
    return list.length > 0 ? list[0] : SONGS[0];
}




KESEMPATAN.RapSoundbank = {
    SONGS: SONGS,
    getAllSongs: getAllSongs,
    getSongById: getSongById,
    getSongsByGenre: getSongsByGenre,
    recommendSongForPersona: recommendSongForPersona,
    getDefaultSongForGenre: getDefaultSongForGenre
};
