


const data = [
    
    {
        text: 'Startup tahap awal sebaiknya mengejar pertumbuhan yang bisa diulang dan diskalakan, bukan sekadar pertumbuhan cepat — akuisisi pelanggan yang tidak menguntungkan hanya menunda kematian bisnis dengan biaya modal yang lebih mahal.',
        metadata: { category: 'dataset', domain: 'global', agent: 'StartupFounder', topic: 'pertumbuhan berkelanjutan', tags: ['startup', 'pertumbuhan'] }
    },
    {
        text: 'Product-market fit ditandai bukan oleh angka unduhan yang tinggi, melainkan oleh pelanggan yang akan sangat kecewa jika produk itu tidak ada lagi — sinyal ini jauh lebih dapat diandalkan daripada metrik vanity semata.',
        metadata: { category: 'dataset', domain: 'global', agent: 'StartupFounder', topic: 'product-market fit', tags: ['startup', 'validasi produk'] }
    },
    {
        text: 'Pendiri startup yang bertahan lama biasanya belajar mengelola energi mental sendiri sama seriusnya dengan mengelola arus kas perusahaan — kelelahan pendiri sering menjadi penyebab kegagalan yang jarang dibahas terbuka.',
        metadata: { category: 'dataset', domain: 'global', agent: 'StartupFounder', topic: 'kesehatan mental pendiri', tags: ['startup', 'kepemimpinan'] }
    },

    
    {
        text: 'Model kekuasaan hukum (power law) dalam pendanaan ventura berarti mayoritas keuntungan sebuah dana modal ventura biasanya datang dari satu atau dua investasi yang menjadi sangat besar, bukan dari rata-rata seluruh portofolio.',
        metadata: { category: 'dataset', domain: 'global', agent: 'VentureCapitalist', topic: 'power law investasi', tags: ['venture capital', 'portofolio'] }
    },
    {
        text: 'Investor ventura menilai tim pendiri sama pentingnya dengan ide bisnis itu sendiri, karena ide sering berubah arah (pivot) di tengah jalan, sementara kapasitas eksekusi dan adaptasi tim adalah faktor yang relatif lebih konstan.',
        metadata: { category: 'dataset', domain: 'global', agent: 'VentureCapitalist', topic: 'penilaian tim pendiri', tags: ['venture capital', 'due diligence'] }
    },
    {
        text: 'Valuasi startup di tahap awal lebih banyak mencerminkan negosiasi dan sentimen pasar dibanding fundamental keuangan yang solid, karena pada tahap ini perusahaan sering belum memiliki riwayat pendapatan yang bisa dianalisis mendalam.',
        metadata: { category: 'dataset', domain: 'global', agent: 'VentureCapitalist', topic: 'valuasi tahap awal', tags: ['venture capital', 'valuasi'] }
    },

    
    {
        text: 'Manajemen risiko yang matang membedakan antara risiko yang bisa diterima, dimitigasi, dipindahkan lewat asuransi, atau dihindari sama sekali — mencoba menghilangkan semua risiko biasanya justru menghilangkan peluang pertumbuhan.',
        metadata: { category: 'dataset', domain: 'global', agent: 'RiskManager', topic: 'kategori respons risiko', tags: ['manajemen risiko', 'strategi'] }
    },
    {
        text: 'Risiko konsentrasi muncul ketika bisnis terlalu bergantung pada satu pelanggan besar, satu pemasok, atau satu pasar geografis — diversifikasi sederhana sering menjadi mitigasi paling efektif dibanding instrumen lindung nilai yang rumit.',
        metadata: { category: 'dataset', domain: 'global', agent: 'RiskManager', topic: 'risiko konsentrasi', tags: ['manajemen risiko', 'diversifikasi'] }
    },
    {
        text: 'Skenario risiko ekor gemuk (fat tail) — kejadian langka dengan dampak sangat besar — sering diremehkan dalam perencanaan bisnis normal karena model statistik standar mengasumsikan distribusi yang terlalu rapi untuk merepresentasikan dunia nyata.',
        metadata: { category: 'dataset', domain: 'global', agent: 'RiskManager', topic: 'risiko ekor gemuk', tags: ['manajemen risiko', 'statistik'] }
    },

    
    {
        text: 'Peramalan tren yang kredibel membedakan antara sinyal (perubahan struktural yang persisten) dan derau (fluktuasi acak jangka pendek) — kesalahan paling umum adalah memperlakukan derau seolah-olah itu sinyal tren besar.',
        metadata: { category: 'dataset', domain: 'global', agent: 'FutureForecaster', topic: 'sinyal vs derau', tags: ['forecasting', 'analisis tren'] }
    },
    {
        text: 'Metode Delphi mengumpulkan opini dari sekelompok pakar secara anonim dan berulang untuk mencapai konvergensi pandangan tentang masa depan, mengurangi bias dominasi opini individu yang paling vokal dalam diskusi kelompok biasa.',
        metadata: { category: 'dataset', domain: 'global', agent: 'FutureForecaster', topic: 'metode delphi', tags: ['forecasting', 'metodologi'] }
    },
    {
        text: 'Teknologi eksponensial seperti kecerdasan buatan dan bioteknologi sering diremehkan dampaknya dalam jangka pendek dan dilebih-lebihkan dalam jangka sangat panjang, sementara dampak nyatanya justru muncul di jangka menengah yang paling sulit diprediksi.',
        metadata: { category: 'dataset', domain: 'global', agent: 'FutureForecaster', topic: 'teknologi eksponensial', tags: ['forecasting', 'teknologi'] }
    },

    
    {
        text: 'Generasi Z tumbuh sebagai generasi digital native pertama yang mengalami internet seumur hidup mereka, membentuk ekspektasi terhadap kecepatan informasi dan transparansi merek yang jauh lebih tinggi dibanding generasi sebelumnya.',
        metadata: { category: 'dataset', domain: 'global', agent: 'GenZAnalyst', topic: 'digital native', tags: ['gen z', 'perilaku konsumen'] }
    },
    {
        text: 'Preferensi karier Generasi Z cenderung memprioritaskan keseimbangan hidup-kerja dan keselarasan nilai personal dengan misi perusahaan, kadang di atas kompensasi finansial semata — pergeseran ini menantang model retensi talenta tradisional.',
        metadata: { category: 'dataset', domain: 'global', agent: 'GenZAnalyst', topic: 'preferensi karier gen z', tags: ['gen z', 'sumber daya manusia'] }
    },
    {
        text: 'Loyalitas merek di kalangan Generasi Z lebih dipengaruhi oleh keaslian dan sikap sosial merek dibanding iklan konvensional — mereka cenderung lebih percaya rekomendasi dari kreator konten yang dianggap otentik daripada figur selebritas tradisional.',
        metadata: { category: 'dataset', domain: 'global', agent: 'GenZAnalyst', topic: 'loyalitas merek gen z', tags: ['gen z', 'pemasaran'] }
    },

    
    {
        text: 'Efek jangkar (anchoring) membuat keputusan finansial seseorang terpengaruh secara tidak proporsional oleh angka pertama yang mereka lihat, bahkan ketika angka itu tidak relevan — inilah mengapa harga coret di label diskon efektif memengaruhi persepsi nilai.',
        metadata: { category: 'dataset', domain: 'global', agent: 'BehavioralEconomist', topic: 'efek jangkar', tags: ['ekonomi perilaku', 'bias'] }
    },
    {
        text: 'Aversi kerugian menjelaskan mengapa rasa sakit kehilangan sejumlah uang terasa lebih kuat dibanding kesenangan mendapatkan jumlah yang sama — prinsip ini mendasari mengapa jaminan uang kembali lebih efektif memicu pembelian dibanding diskon setara.',
        metadata: { category: 'dataset', domain: 'global', agent: 'BehavioralEconomist', topic: 'aversi kerugian', tags: ['ekonomi perilaku', 'psikologi keputusan'] }
    },
    {
        text: 'Nudge atau dorongan halus dalam desain pilihan, seperti menjadikan opsi menabung sebagai pilihan default, terbukti mengubah perilaku finansial masyarakat secara signifikan tanpa perlu melarang atau memaksa pilihan alternatif apa pun.',
        metadata: { category: 'dataset', domain: 'global', agent: 'BehavioralEconomist', topic: 'nudge theory', tags: ['ekonomi perilaku', 'kebijakan'] }
    },

    
    {
        text: 'Perjalanan keputusan konsumen modern jarang bersifat linier dari kesadaran ke pembelian — konsumen sering bolak-balik antara riset, perbandingan, dan penundaan sebelum akhirnya mengambil keputusan, terutama untuk pembelian bernilai tinggi.',
        metadata: { category: 'dataset', domain: 'global', agent: 'ConsumerBehavior', topic: 'perjalanan keputusan konsumen', tags: ['perilaku konsumen', 'customer journey'] }
    },
    {
        text: 'Bukti sosial dalam bentuk ulasan pelanggan dan jumlah pengguna berpengaruh kuat terhadap keputusan pembelian karena manusia secara alami menggunakan perilaku orang lain sebagai sinyal keamanan dalam mengambil keputusan yang tidak pasti.',
        metadata: { category: 'dataset', domain: 'global', agent: 'ConsumerBehavior', topic: 'bukti sosial', tags: ['perilaku konsumen', 'psikologi sosial'] }
    },
    {
        text: 'Paradoks pilihan menunjukkan bahwa terlalu banyak opsi produk justru bisa menurunkan kemungkinan konsumen membeli sama sekali, karena beban kognitif untuk membandingkan semua pilihan membuat mereka menunda keputusan atau membatalkannya.',
        metadata: { category: 'dataset', domain: 'global', agent: 'ConsumerBehavior', topic: 'paradoks pilihan', tags: ['perilaku konsumen', 'desain pilihan'] }
    },

    
    {
        text: 'Prinsip diversifikasi portofolio menyebar risiko investasi ke berbagai kelas aset yang tidak selalu bergerak searah, sehingga kerugian di satu aset bisa diimbangi kinerja aset lain — ini mengurangi volatilitas tanpa harus mengorbankan seluruh potensi imbal hasil.',
        metadata: { category: 'dataset', domain: 'global', agent: 'FinancialPlanner', topic: 'diversifikasi portofolio', tags: ['perencanaan keuangan', 'investasi'] }
    },
    {
        text: 'Dana darurat idealnya mencukupi tiga hingga enam bulan pengeluaran rutin, disimpan dalam instrumen yang mudah dicairkan — ini menjadi lapisan pertahanan pertama sebelum seseorang mulai berinvestasi di instrumen yang lebih berisiko.',
        metadata: { category: 'dataset', domain: 'global', agent: 'FinancialPlanner', topic: 'dana darurat', tags: ['perencanaan keuangan', 'manajemen risiko personal'] }
    },
    {
        text: 'Bunga majemuk bekerja jauh lebih kuat dalam jangka panjang dibanding jangka pendek, sehingga memulai investasi sejak usia muda dengan jumlah kecil sering menghasilkan akumulasi kekayaan yang lebih besar dibanding memulai besar-besaran di usia yang lebih tua.',
        metadata: { category: 'dataset', domain: 'global', agent: 'FinancialPlanner', topic: 'bunga majemuk', tags: ['perencanaan keuangan', 'investasi jangka panjang'] }
    },

    
    {
        text: 'Pemikiran kelompok (groupthink) muncul ketika keinginan untuk mencapai konsensus mengalahkan evaluasi kritis terhadap sebuah rencana — peran devil\'s advocate secara sengaja menantang asumsi tim untuk mencegah keputusan buruk lolos tanpa diuji.',
        metadata: { category: 'dataset', domain: 'global', agent: 'DevilsAdvocate', topic: 'groupthink', tags: ['pengambilan keputusan', 'dinamika tim'] }
    },
    {
        text: 'Pramortem adalah teknik membayangkan bahwa sebuah proyek sudah gagal total di masa depan, lalu bekerja mundur mencari sebab-sebab kegagalan itu — teknik ini terbukti mengungkap risiko yang terlewat dibanding sekadar bertanya "apa yang bisa salah".',
        metadata: { category: 'dataset', domain: 'global', agent: 'DevilsAdvocate', topic: 'pramortem', tags: ['pengambilan keputusan', 'manajemen risiko'] }
    },
    {
        text: 'Menantang rencana yang sudah disepakati bukan berarti menolaknya, melainkan menguji ketahanannya terhadap skenario terburuk — rencana yang benar-benar solid seharusnya bisa menjawab kritik tajam tanpa runtuh sepenuhnya.',
        metadata: { category: 'dataset', domain: 'global', agent: 'DevilsAdvocate', topic: 'menguji ketahanan rencana', tags: ['pengambilan keputusan', 'stress test'] }
    },

    
    {
        text: 'Filosofi silih asah, silih asih, silih asuh dalam budaya Sunda mengajarkan bahwa kemitraan bisnis yang langgeng dibangun di atas saling mengasah kemampuan, saling menyayangi, dan saling menjaga — bukan sekadar transaksi untung-rugi semata.',
        metadata: { category: 'dataset', domain: 'global', agent: 'SundanyaAsep', topic: 'filosofi bisnis sunda', tags: ['budaya sunda', 'etika bisnis'] }
    },
    {
        text: 'Pedagang Sunda tradisional dikenal dengan prinsip someah hade ka semah, keramahan kepada siapa pun yang datang — nilai ini jadi modal sosial penting dalam membangun hubungan pelanggan jangka panjang di pasar-pasar lokal Jawa Barat.',
        metadata: { category: 'dataset', domain: 'global', agent: 'SundanyaAsep', topic: 'keramahan dagang', tags: ['budaya sunda', 'layanan pelanggan'] }
    },
    {
        text: 'Banyak sentra industri rumahan di Jawa Barat, dari kerajinan bambu di Tasikmalaya hingga rajutan di Bandung, tumbuh dari sistem kekerabatan yang saling berbagi keterampilan antar-tetangga, menciptakan klaster usaha kecil yang kompetitif secara kolektif.',
        metadata: { category: 'dataset', domain: 'global', agent: 'SundanyaAsep', topic: 'klaster industri rumahan', tags: ['budaya sunda', 'ekonomi lokal'] }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('DatasetGlobal', 'Loaded ' + data.length + ' entri dataset perspektif bisnis global');
}
