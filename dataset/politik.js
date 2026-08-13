// KESEMPATAN OS - DATASET: POLITIK
// Selaras dengan 5 agent di agents/agents-politics.js. Lihat dataset/bisnis.js
// untuk catatan desain lengkap folder ini.
const data = [
    // ================= POLITIK DALAM NEGERI =================
    {
        text: 'Sistem pemilu proporsional terbuka yang dipakai di Indonesia memungkinkan pemilih memilih langsung calon legislatif, bukan hanya partai, sehingga popularitas individu kandidat bisa mengalahkan urutan nomor yang ditetapkan partai.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'PolitikDalamNegeri', topic: 'sistem pemilu', tags: ['pemilu', 'sistem politik'] }
    },
    {
        text: 'Desentralisasi otonomi daerah memberi pemerintah daerah kewenangan lebih besar mengelola anggaran dan kebijakan lokal, tapi juga menuntut kapasitas birokrasi daerah yang memadai agar wewenang itu tidak disalahgunakan atau justru terbengkalai.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'PolitikDalamNegeri', topic: 'otonomi daerah', tags: ['desentralisasi', 'pemerintahan daerah'] }
    },
    {
        text: 'Koalisi politik di parlemen multipartai sering dibentuk berdasarkan kepentingan pragmatis jangka pendek ketimbang kesamaan ideologi, yang membuat stabilitas koalisi rentan berubah seiring dinamika kekuasaan dan kepentingan elektoral.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'PolitikDalamNegeri', topic: 'koalisi parlemen', tags: ['parlemen', 'koalisi'] }
    },

    // ================= HUBUNGAN INTERNASIONAL =================
    {
        text: 'Diplomasi jalur kedua yang melibatkan akademisi, LSM, dan tokoh masyarakat sipil sering membuka ruang dialog yang tidak bisa dijangkau diplomasi resmi antarnegara, terutama dalam konflik yang sensitif secara politik.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'HubunganInternasional', topic: 'diplomasi jalur kedua', tags: ['diplomasi', 'hubungan internasional'] }
    },
    {
        text: 'ASEAN mengedepankan prinsip non-intervensi dan konsensus dalam pengambilan keputusan, yang menjaga stabilitas regional tapi juga sering dikritik karena memperlambat respons terhadap krisis kemanusiaan di negara anggota.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'HubunganInternasional', topic: 'prinsip asean', tags: ['asean', 'kerja sama regional'] }
    },
    {
        text: 'Politik luar negeri bebas aktif Indonesia berarti tidak memihak blok kekuatan besar mana pun sambil tetap berperan aktif dalam isu perdamaian dunia, sebuah prinsip yang terus diuji di tengah persaingan geopolitik kontemporer.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'HubunganInternasional', topic: 'politik luar negeri bebas aktif', tags: ['kebijakan luar negeri', 'indonesia'] }
    },

    // ================= KEBIJAKAN PUBLIK =================
    {
        text: 'Kebijakan publik yang efektif melewati siklus penyusunan agenda, formulasi, implementasi, dan evaluasi — kebijakan yang bagus di atas kertas sering gagal karena tahap implementasi diabaikan atau tidak dianggarkan memadai.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'KebijakanPublik', topic: 'siklus kebijakan', tags: ['kebijakan publik', 'implementasi'] }
    },
    {
        text: 'Subsidi yang tidak tepat sasaran cenderung lebih dinikmati kelompok mampu yang mengonsumsi lebih banyak, sehingga kebijakan subsidi yang baik butuh mekanisme penargetan yang akurat agar manfaatnya sampai ke kelompok yang benar-benar membutuhkan.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'KebijakanPublik', topic: 'penargetan subsidi', tags: ['subsidi', 'kesejahteraan sosial'] }
    },
    {
        text: 'Evaluasi kebijakan berbasis bukti membandingkan hasil program dengan kelompok kontrol yang tidak menerima intervensi, sehingga bisa disimpulkan dampak sebenarnya dari kebijakan, bukan sekadar korelasi dengan perubahan yang mungkin terjadi karena faktor lain.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'KebijakanPublik', topic: 'evaluasi berbasis bukti', tags: ['evaluasi kebijakan', 'metodologi'] }
    },

    // ================= GEOPOLITIK =================
    {
        text: 'Selat Malaka menjadi salah satu jalur pelayaran tersibuk dan paling strategis di dunia karena menghubungkan Samudra Hindia dan Pasifik, menjadikan kawasan ini titik krusial dalam persaingan pengaruh kekuatan besar di Asia.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'Geopolitik', topic: 'selat malaka', tags: ['geopolitik maritim', 'asia tenggara'] }
    },
    {
        text: 'Ketergantungan energi suatu negara terhadap pemasok tunggal menciptakan kerentanan geopolitik yang bisa dimanfaatkan sebagai alat tekanan diplomatik, mendorong banyak negara mendiversifikasi sumber energi demi keamanan nasional.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'Geopolitik', topic: 'keamanan energi', tags: ['geopolitik energi', 'keamanan nasional'] }
    },
    {
        text: 'Persaingan pengaruh kekuatan besar di kawasan Indo-Pasifik mendorong negara-negara menengah seperti Indonesia menjalankan strategi hedging — menjaga hubungan baik dengan berbagai kekuatan besar tanpa terikat penuh pada satu pihak.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'Geopolitik', topic: 'strategi hedging', tags: ['geopolitik', 'indo-pasifik'] }
    },

    // ================= KOMUNIKASI POLITIK =================
    {
        text: 'Framing dalam komunikasi politik menentukan bagaimana suatu isu dipersepsikan publik — isu yang sama bisa dibingkai sebagai "kebebasan individu" oleh satu pihak dan "tanggung jawab kolektif" oleh pihak lain, menghasilkan reaksi publik yang sangat berbeda.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'KomunikasiPolitik', topic: 'framing politik', tags: ['komunikasi politik', 'persepsi publik'] }
    },
    {
        text: 'Media sosial mengubah lanskap komunikasi politik dengan memungkinkan komunikasi dua arah langsung antara politisi dan publik, tapi juga mempercepat penyebaran disinformasi yang sulit diverifikasi kebenarannya secara real-time.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'KomunikasiPolitik', topic: 'media sosial dan politik', tags: ['komunikasi politik', 'disinformasi'] }
    },
    {
        text: 'Pesan politik yang efektif menyederhanakan isu kompleks menjadi narasi yang mudah dipahami tanpa kehilangan substansi penting — kegagalan menyeimbangkan kesederhanaan dengan akurasi sering menghasilkan janji politik yang mustahil ditepati.',
        metadata: { category: 'dataset', domain: 'politik', agent: 'KomunikasiPolitik', topic: 'penyederhanaan pesan', tags: ['komunikasi politik', 'narasi'] }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('DatasetPolitik', 'Loaded ' + data.length + ' entri dataset politik');
}
