// KESEMPATAN OS - DATASET: BISNIS INTI
// Korpus konteks untuk LLM lokal, selaras dengan 14 agent inti bisnis di
// agents/agents-config.js. Bukan RAG/world-knowledge (itu tugas dataries/) —
// folder dataset/ ini khusus jadi bahan bacaan tambahan (di luar system
// prompt) untuk melatih & memberi konteks LLM lokal lewat
// buildBootstrapCorpus() di js/workflow/workflow-llm-bridge.js.
const data = [
    // ================= RAHMAD RAHARJO (Senior Business Strategist) =================
    {
        text: 'Peluang bisnis terbaik sering muncul di celah antara kebutuhan yang belum terlayani dan sumber daya yang belum dimanfaatkan. Analis peluang yang baik selalu bertanya: siapa yang paling dirugikan oleh kondisi saat ini, dan apa yang bisa dibayar mahal untuk menghilangkan masalah itu.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'RahmadRaharjo', topic: 'identifikasi peluang', tags: ['strategi', 'peluang', 'analisis pasar'] }
    },
    {
        text: 'Sebuah ide bisnis baru sebaiknya diuji dengan tiga pertanyaan: apakah ada yang mau membayar, apakah margin cukup sehat setelah biaya akuisisi pelanggan, dan apakah bisa bertahan ketika pesaing besar masuk. Ide yang gagal di salah satu dari tiga itu perlu dirombak sebelum dieksekusi.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'RahmadRaharjo', topic: 'validasi ide', tags: ['validasi', 'model bisnis'] }
    },
    {
        text: 'Pengusaha yang berpengalaman tahu bahwa timing pasar sering lebih menentukan daripada kualitas produk. Masuk terlalu awal berarti mendidik pasar dengan biaya sendiri; masuk terlalu telat berarti berebut sisa margin dengan pemain yang sudah mapan.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'RahmadRaharjo', topic: 'timing pasar', tags: ['timing', 'strategi masuk pasar'] }
    },

    // ================= MANAGER (Strategic Business Coordinator) =================
    {
        text: 'Koordinasi tim lintas fungsi berjalan baik ketika setiap anggota tahu persis siapa pemilik keputusan akhir untuk tiap area kerja. Ambiguitas kepemilikan adalah penyebab paling umum proyek yang molor tanpa sebab yang jelas.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Manager', topic: 'koordinasi tim', tags: ['manajemen', 'eksekusi', 'akuntabilitas'] }
    },
    {
        text: 'Rapat evaluasi mingguan paling efektif kalau fokus pada tiga hal: apa yang tercapai, apa yang terhambat, dan keputusan apa yang perlu diambil sekarang juga. Rapat yang cuma melaporkan status tanpa keputusan adalah pemborosan waktu tim.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Manager', topic: 'manajemen rapat', tags: ['manajemen', 'produktivitas'] }
    },
    {
        text: 'Skala prioritas yang sehat membedakan antara yang penting-mendesak, penting-tidak mendesak, mendesak-tidak penting, dan bukan keduanya. Manajer yang baik menghabiskan waktu paling banyak di kuadran penting-tidak mendesak, bukan sibuk memadamkan api.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Manager', topic: 'prioritas', tags: ['manajemen waktu', 'prioritas'] }
    },

    // ================= HUNTER (Opportunity Seeker) =================
    {
        text: 'Pemburu peluang yang jeli memantau tiga sinyal: perubahan regulasi yang membuka celah baru, pergeseran perilaku konsumen yang belum direspons pemain lama, dan teknologi baru yang menurunkan biaya masuk ke industri tertentu.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Hunter', topic: 'sinyal peluang', tags: ['peluang', 'trend watching'] }
    },
    {
        text: 'Peluang di pasar yang sedang jenuh biasanya ada di segmen yang diabaikan pemain besar karena dianggap terlalu kecil atau terlalu rumit untuk dilayani secara massal — di situlah ruang bagi pemain baru yang lincah.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Hunter', topic: 'niche market', tags: ['niche', 'segmentasi'] }
    },
    {
        text: 'Sebelum mengejar peluang baru, penting memetakan berapa besar total addressable market, seberapa cepat pasar itu tumbuh, dan seberapa mudah pesaing baru bisa meniru begitu peluang terbukti menguntungkan.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Hunter', topic: 'ukuran pasar', tags: ['tam', 'analisis pasar'] }
    },

    // ================= ANALYST (Quantitative Analyst) =================
    {
        text: 'Analisis kuantitatif yang kredibel selalu memisahkan korelasi dari kausalitas. Dua variabel yang bergerak bersamaan belum tentu satu menyebabkan yang lain — bisa jadi keduanya dipengaruhi faktor ketiga yang tidak terlihat di data.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Analyst', topic: 'korelasi vs kausalitas', tags: ['statistik', 'analisis data'] }
    },
    {
        text: 'Rasio keuangan seperti gross margin, burn rate, dan customer acquisition cost hanya bermakna kalau dibandingkan dengan benchmark industri yang relevan, bukan angka absolut yang berdiri sendiri.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Analyst', topic: 'rasio keuangan', tags: ['keuangan', 'benchmark'] }
    },
    {
        text: 'Proyeksi pertumbuhan yang linier dari data historis sering menyesatkan karena mengabaikan efek saturasi pasar. Model yang lebih realistis biasanya berbentuk kurva-S, bukan garis lurus yang naik terus tanpa batas.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Analyst', topic: 'proyeksi pertumbuhan', tags: ['forecasting', 'model pertumbuhan'] }
    },

    // ================= STRATEGIST (Long-term Strategy Planner) =================
    {
        text: 'Strategi jangka panjang yang kuat dibangun di atas keunggulan kompetitif yang sulit ditiru — bisa berupa efek jaringan, biaya berpindah yang tinggi, skala ekonomi, atau merek yang sudah tertanam kuat di benak pelanggan.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Strategist', topic: 'keunggulan kompetitif', tags: ['strategi', 'moat'] }
    },
    {
        text: 'Perencanaan skenario yang baik menyiapkan setidaknya tiga jalur masa depan — optimis, moderat, dan pesimis — beserta pemicu keputusan spesifik yang menandakan kapan harus berpindah dari satu skenario ke skenario lain.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Strategist', topic: 'perencanaan skenario', tags: ['scenario planning', 'strategi'] }
    },
    {
        text: 'Trade-off adalah inti dari strategi: memilih untuk tidak melakukan sesuatu sama pentingnya dengan memilih apa yang dilakukan. Strategi yang mencoba jadi segalanya untuk semua orang biasanya berakhir tidak unggul di mana pun.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Strategist', topic: 'trade-off strategis', tags: ['strategi', 'fokus'] }
    },

    // ================= VERIFIER (Truth & Consistency Verifier) =================
    {
        text: 'Klaim bisnis yang kredibel harus bisa ditelusuri ke sumber data primer. Klaim yang hanya mengutip "penelitian menunjukkan" tanpa rujukan spesifik patut dicurigai sampai terbukti sebaliknya.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Verifier', topic: 'verifikasi klaim', tags: ['verifikasi', 'kredibilitas'] }
    },
    {
        text: 'Konsistensi internal sebuah laporan bisa diuji dengan menyilangkan angka dari bagian yang berbeda — misalnya total penjualan di ringkasan eksekutif harus sama persis dengan jumlah rincian per produk di lampiran.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Verifier', topic: 'konsistensi data', tags: ['verifikasi', 'audit'] }
    },
    {
        text: 'Bias konfirmasi membuat tim cenderung mencari data yang mendukung keputusan yang sudah diinginkan sejak awal. Proses verifikasi yang sehat sengaja mencari bukti yang bisa membantah, bukan hanya yang mengonfirmasi.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Verifier', topic: 'bias konfirmasi', tags: ['bias', 'objektivitas'] }
    },

    // ================= RESEARCHER (Data & Research Specialist) =================
    {
        text: 'Riset pasar yang solid menggabungkan data kuantitatif berskala besar dengan wawancara kualitatif mendalam. Data survei bisa menunjukkan pola, tapi wawancara langsung mengungkap alasan di balik pola itu.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Researcher', topic: 'metode riset campuran', tags: ['riset', 'metodologi'] }
    },
    {
        text: 'Ukuran sampel yang kecil bisa cukup untuk riset eksploratif tahap awal, tapi keputusan investasi besar butuh sampel yang cukup representatif secara statistik agar temuan tidak sekadar kebetulan.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Researcher', topic: 'ukuran sampel', tags: ['riset', 'statistik'] }
    },
    {
        text: 'Riset kompetitor yang berguna bukan sekadar mendaftar fitur produk pesaing, melainkan memahami model bisnis mereka — dari mana mereka mendapat margin, dan area mana yang secara struktural sulit mereka tiru.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Researcher', topic: 'riset kompetitor', tags: ['riset', 'kompetitor'] }
    },

    // ================= COPYWRITER (Marketing Copy & Content Writer) =================
    {
        text: 'Copywriting yang efektif berbicara tentang hasil yang diinginkan pembaca, bukan fitur produk. Orang tidak membeli bor listrik karena ingin punya bor — mereka membeli karena ingin lubang yang rapi di dinding.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Copywriter', topic: 'benefit vs fitur', tags: ['copywriting', 'pemasaran'] }
    },
    {
        text: 'Judul yang kuat biasanya mengandung angka spesifik, janji hasil yang konkret, atau rasa urgensi yang jujur — bukan klise generik seperti "solusi terbaik untuk bisnis Anda" yang sudah kehilangan makna karena terlalu sering dipakai.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Copywriter', topic: 'menulis judul', tags: ['copywriting', 'headline'] }
    },
    {
        text: 'Call-to-action yang efektif memberi satu instruksi yang jelas, bukan banyak pilihan yang membingungkan. Terlalu banyak opsi di akhir tulisan justru menurunkan tingkat konversi karena pembaca ragu memilih.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Copywriter', topic: 'call to action', tags: ['copywriting', 'konversi'] }
    },

    // ================= SCRIPT (Video Script Writer) =================
    {
        text: 'Tiga detik pertama sebuah video menentukan apakah penonton bertahan atau langsung menggeser. Naskah video yang baik membuka dengan hook yang langsung menjawab "apa untungnya bagi saya", bukan perkenalan panjang.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Script', topic: 'hook video', tags: ['naskah', 'video'] }
    },
    {
        text: 'Struktur naskah video pendek yang teruji: masalah yang relate, agitasi singkat, solusi yang ditawarkan, bukti sosial ringkas, dan penutup dengan ajakan bertindak yang spesifik — semua dalam kurang dari 60 detik.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Script', topic: 'struktur naskah', tags: ['naskah', 'video pendek'] }
    },
    {
        text: 'Dialog dalam naskah promosi terasa lebih otentik kalau ditulis seperti orang bicara sungguhan — kalimat pendek, jeda alami, dan sesekali kalimat tidak lengkap — bukan seperti membaca brosur yang dibacakan keras.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Script', topic: 'gaya dialog', tags: ['naskah', 'gaya bahasa'] }
    },

    // ================= PLANNER (Content & Social Media Planner) =================
    {
        text: 'Kalender konten yang sehat menyeimbangkan tiga jenis konten: edukatif yang membangun kepercayaan, menghibur yang membangun jangkauan, dan promosi langsung yang mengonversi — dengan rasio yang condong ke dua jenis pertama.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Planner', topic: 'jenis konten', tags: ['perencanaan konten', 'media sosial'] }
    },
    {
        text: 'Jadwal posting yang konsisten lebih berpengaruh pada pertumbuhan jangka panjang daripada frekuensi tinggi yang tidak menentu. Algoritma platform cenderung memprioritaskan akun yang polanya bisa diprediksi.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Planner', topic: 'konsistensi jadwal', tags: ['perencanaan konten', 'algoritma'] }
    },
    {
        text: 'Perencanaan konten yang matang selalu punya rencana daur ulang — satu ide inti diadaptasi ke beberapa format berbeda (video pendek, thread, infografis) daripada membuat ide baru dari nol setiap saat.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Planner', topic: 'daur ulang konten', tags: ['perencanaan konten', 'efisiensi'] }
    },

    // ================= DISTRIBUTOR (Distribution Channel Manager) =================
    {
        text: 'Pemilihan kanal distribusi harus mempertimbangkan di mana pelanggan ideal sudah menghabiskan waktu, bukan kanal mana yang paling populer secara umum. Kanal yang tepat untuk produk B2B jarang sama dengan produk konsumen massal.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Distributor', topic: 'pemilihan kanal', tags: ['distribusi', 'kanal'] }
    },
    {
        text: 'Ketergantungan pada satu kanal distribusi tunggal adalah risiko konsentrasi yang serius — perubahan algoritma atau kebijakan platform bisa menghapus sebagian besar bisnis dalam semalam kalau tidak ada kanal cadangan.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Distributor', topic: 'diversifikasi kanal', tags: ['distribusi', 'risiko'] }
    },
    {
        text: 'Biaya distribusi per unit turun signifikan ketika volume naik lewat kemitraan grosir, tapi ini sering mengorbankan margin dan kontrol langsung atas pengalaman pelanggan — trade-off yang harus dihitung matang.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Distributor', topic: 'skala distribusi', tags: ['distribusi', 'margin'] }
    },

    // ================= OPTIMIZER (Performance & Conversion Optimizer) =================
    {
        text: 'Optimasi konversi yang sistematis dimulai dari mengidentifikasi titik dengan drop-off tertinggi di funnel, bukan mengubah semua elemen halaman sekaligus tanpa tahu mana yang sebenarnya bermasalah.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Optimizer', topic: 'analisis funnel', tags: ['optimasi', 'konversi'] }
    },
    {
        text: 'A/B testing hanya valid secara statistik kalau dijalankan sampai mencapai ukuran sampel dan durasi yang cukup — menghentikan tes lebih awal begitu satu varian tampak unggul sering menghasilkan kesimpulan palsu.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Optimizer', topic: 'a/b testing', tags: ['optimasi', 'eksperimen'] }
    },
    {
        text: 'Kecepatan muat halaman berkorelasi langsung dengan tingkat konversi — setiap detik tambahan waktu muat secara konsisten terbukti menurunkan kemungkinan pengunjung menyelesaikan transaksi.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Optimizer', topic: 'kecepatan halaman', tags: ['optimasi', 'ux'] }
    },

    // ================= MEMORY (Memory & Knowledge Manager) =================
    {
        text: 'Basis pengetahuan organisasi yang berguna mengorganisir informasi berdasarkan konteks penggunaan, bukan hanya berdasarkan kategori topik — orang mencari jawaban saat menghadapi masalah spesifik, bukan sedang membaca ensiklopedia.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Memory', topic: 'organisasi pengetahuan', tags: ['manajemen pengetahuan', 'dokumentasi'] }
    },
    {
        text: 'Informasi yang tidak diperbarui secara berkala menjadi utang pengetahuan — keputusan yang diambil berdasarkan data usang bisa lebih berbahaya daripada tidak punya data sama sekali karena menciptakan rasa percaya diri yang keliru.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Memory', topic: 'pembaruan data', tags: ['manajemen pengetahuan', 'akurasi'] }
    },
    {
        text: 'Konteks historis dari sebuah keputusan sama pentingnya dengan keputusan itu sendiri — mencatat alasan di balik pilihan masa lalu mencegah organisasi mengulang eksperimen yang sudah pernah gagal dengan alasan yang sama.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'Memory', topic: 'konteks historis', tags: ['manajemen pengetahuan', 'pembelajaran organisasi'] }
    },

    // ================= PROMPTOPTIMIZER (Prompt Engineer & A/B Testing Specialist) =================
    {
        text: 'Prompt yang efektif untuk model bahasa memberi konteks peran yang jelas, format keluaran yang eksplisit, dan contoh konkret — instruksi yang abstrak seperti "jawab dengan baik" hampir selalu menghasilkan keluaran yang tidak konsisten.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'PromptOptimizer', topic: 'struktur prompt', tags: ['prompt engineering', 'ai'] }
    },
    {
        text: 'Pengujian A/B terhadap variasi prompt harus mengubah satu variabel dalam satu waktu — mengganti persona sekaligus format keluaran dalam eksperimen yang sama membuat sulit menyimpulkan perubahan mana yang benar-benar berpengaruh.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'PromptOptimizer', topic: 'pengujian prompt', tags: ['prompt engineering', 'eksperimen'] }
    },
    {
        text: 'Prompt yang terlalu panjang dan penuh instruksi kontradiktif justru menurunkan kualitas jawaban model — kejelasan dan keringkasan instruksi lebih penting daripada jumlah aturan yang dijejalkan sekaligus.',
        metadata: { category: 'dataset', domain: 'bisnis', agent: 'PromptOptimizer', topic: 'keringkasan prompt', tags: ['prompt engineering', 'kualitas'] }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('DatasetBisnis', 'Loaded ' + data.length + ' entri dataset bisnis inti');
}
