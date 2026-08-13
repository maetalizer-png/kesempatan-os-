




const data = [
    
    {
        text: 'Kontrak yang mengikat secara hukum di Indonesia butuh empat syarat sah: kesepakatan para pihak, kecakapan bertindak, objek yang jelas, dan sebab yang halal — kehilangan salah satu syarat ini bisa membuat kontrak batal demi hukum.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Hukum', topic: 'syarat sah kontrak', tags: ['hukum perdata', 'kontrak'] }
    },
    {
        text: 'Prinsip praduga tak bersalah mewajibkan setiap orang dianggap tidak bersalah sampai ada putusan pengadilan yang berkekuatan hukum tetap — prinsip ini melindungi individu dari penghakiman publik sebelum proses hukum selesai.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Hukum', topic: 'praduga tak bersalah', tags: ['hukum pidana', 'hak asasi'] }
    },
    {
        text: 'Hierarki peraturan perundang-undangan di Indonesia menempatkan UUD 1945 di puncak, diikuti Ketetapan MPR, Undang-Undang, Peraturan Pemerintah, hingga Peraturan Daerah — aturan yang lebih rendah tidak boleh bertentangan dengan yang di atasnya.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Hukum', topic: 'hierarki perundangan', tags: ['hukum tata negara', 'regulasi'] }
    },

    
    {
        text: 'Inflasi yang moderat dan terkendali umumnya dianggap sehat bagi ekonomi karena mendorong konsumsi dan investasi, tapi inflasi yang terlalu tinggi mengikis daya beli dan menciptakan ketidakpastian yang menghambat perencanaan jangka panjang.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Ekonomi', topic: 'inflasi', tags: ['makroekonomi', 'kebijakan moneter'] }
    },
    {
        text: 'Hukum permintaan dan penawaran menjelaskan bahwa harga cenderung naik ketika permintaan melebihi pasokan, dan turun ketika pasokan melebihi permintaan — namun elastisitas tiap barang menentukan seberapa besar respons harga terhadap perubahan itu.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Ekonomi', topic: 'permintaan dan penawaran', tags: ['mikroekonomi', 'harga'] }
    },
    {
        text: 'Produk Domestik Bruto mengukur total nilai barang dan jasa yang dihasilkan suatu negara dalam periode tertentu, tapi tidak menangkap distribusi kesejahteraan — pertumbuhan PDB yang tinggi bisa berjalan bersamaan dengan kesenjangan yang melebar.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Ekonomi', topic: 'pdb dan kesejahteraan', tags: ['makroekonomi', 'pembangunan'] }
    },

    
    {
        text: 'Bias ketersediaan membuat orang menilai kemungkinan suatu kejadian berdasarkan seberapa mudah contoh kejadian itu diingat, bukan berdasarkan frekuensi statistik sebenarnya — inilah sebabnya berita tentang kecelakaan pesawat terasa lebih menakutkan daripada risiko kecelakaan mobil yang sebenarnya jauh lebih tinggi.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Psikologi', topic: 'bias ketersediaan', tags: ['psikologi kognitif', 'bias'] }
    },
    {
        text: 'Motivasi intrinsik yang muncul dari rasa kompetensi, otonomi, dan keterhubungan sosial cenderung lebih tahan lama dibanding motivasi ekstrinsik seperti hadiah uang, yang bahkan bisa menurunkan minat alami seseorang terhadap suatu aktivitas.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Psikologi', topic: 'motivasi intrinsik', tags: ['psikologi motivasi', 'perilaku'] }
    },
    {
        text: 'Disonansi kognitif muncul ketika seseorang memegang dua keyakinan yang bertentangan sekaligus, dan biasanya diselesaikan dengan mengubah salah satu keyakinan agar konsisten — sering kali bukan dengan mengubah perilaku, melainkan mengubah cara membenarkannya.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Psikologi', topic: 'disonansi kognitif', tags: ['psikologi sosial', 'kognisi'] }
    },

    
    {
        text: 'Indonesia terletak di pertemuan tiga lempeng tektonik utama — Eurasia, Indo-Australia, dan Pasifik — yang menjelaskan mengapa negara ini memiliki aktivitas gunung berapi dan gempa bumi yang tinggi, sekaligus tanah vulkanik yang subur untuk pertanian.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Geografi', topic: 'lempeng tektonik indonesia', tags: ['geografi fisik', 'geologi'] }
    },
    {
        text: 'Iklim tropis dengan dua musim, kemarau dan hujan, dipengaruhi oleh pergerakan angin muson yang berganti arah setiap enam bulan — pola inilah yang menentukan jadwal tanam padi di sebagian besar wilayah Indonesia.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Geografi', topic: 'iklim tropis dan muson', tags: ['geografi iklim', 'pertanian'] }
    },
    {
        text: 'Urbanisasi yang cepat mendorong pertumbuhan kota-kota besar melampaui kapasitas infrastrukturnya, menciptakan tantangan kemacetan, banjir, dan permukiman padat yang membutuhkan perencanaan tata ruang yang lebih matang.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Geografi', topic: 'urbanisasi', tags: ['geografi perkotaan', 'tata ruang'] }
    },

    
    {
        text: 'Proklamasi kemerdekaan Indonesia pada 17 Agustus 1945 merupakan puncak dari pergerakan nasional yang dibangun selama puluhan tahun melalui organisasi seperti Budi Utomo, Sarekat Islam, dan Perhimpunan Indonesia yang menumbuhkan kesadaran identitas nasional.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Sejarah', topic: 'proklamasi kemerdekaan', tags: ['sejarah indonesia', 'kemerdekaan'] }
    },
    {
        text: 'Jalur rempah yang menghubungkan Nusantara dengan pedagang Arab, India, Tiongkok, dan kemudian Eropa telah membentuk jaringan perdagangan global selama berabad-abad sebelum kolonialisme, menjadikan wilayah ini pusat ekonomi maritim penting.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Sejarah', topic: 'jalur rempah', tags: ['sejarah maritim', 'perdagangan'] }
    },
    {
        text: 'Revolusi Industri di Eropa pada akhir abad ke-18 mengubah ekonomi berbasis pertanian menjadi berbasis manufaktur, memicu urbanisasi masif dan perubahan struktur sosial yang dampaknya masih terasa dalam pola kerja modern hingga sekarang.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Sejarah', topic: 'revolusi industri', tags: ['sejarah dunia', 'industrialisasi'] }
    },

    
    {
        text: 'Etika deontologis menilai benar-salahnya suatu tindakan dari kesesuaiannya dengan aturan atau kewajiban moral, berbeda dengan etika konsekuensialis yang menilai tindakan dari hasil akhirnya — perdebatan klasik ini muncul terus dalam dilema moral sehari-hari.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Filsafat', topic: 'etika deontologis vs konsekuensialis', tags: ['filsafat moral', 'etika'] }
    },
    {
        text: 'Skeptisisme Cartesian mempertanyakan apakah kita bisa benar-benar yakin akan apa pun selain fakta bahwa kita sedang berpikir — argumen "cogito ergo sum" milik Descartes menjadi titik tolak untuk membangun kembali pengetahuan dari fondasi yang paling pasti.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Filsafat', topic: 'skeptisisme cartesian', tags: ['epistemologi', 'filsafat barat'] }
    },
    {
        text: 'Konsep gotong royong dalam filsafat sosial Nusantara menekankan bahwa kesejahteraan individu tidak bisa dipisahkan dari kesejahteraan komunitas, berbeda dari individualisme liberal yang menempatkan hak perorangan sebagai titik tolak utama.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Filsafat', topic: 'gotong royong', tags: ['filsafat nusantara', 'etika sosial'] }
    },

    
    {
        text: 'Wayang kulit bukan sekadar pertunjukan hiburan, tapi juga media penyampaian nilai moral dan filosofi hidup lewat lakon-lakon yang diadaptasi dari epos Mahabharata dan Ramayana, dengan sisipan kritik sosial kontemporer oleh dalang.',
        metadata: { category: 'dataset', domain: 'general', agent: 'SeniBudaya', topic: 'wayang kulit', tags: ['seni tradisional', 'budaya jawa'] }
    },
    {
        text: 'Batik yang diakui UNESCO sebagai warisan budaya takbenda memiliki motif yang berbeda-beda di tiap daerah, masing-masing membawa makna filosofis tersendiri — batik Solo dan Yogyakarta misalnya punya pakem warna dan pola yang berbeda dari batik pesisir.',
        metadata: { category: 'dataset', domain: 'general', agent: 'SeniBudaya', topic: 'batik', tags: ['warisan budaya', 'kerajinan'] }
    },
    {
        text: 'Musik gamelan menggunakan sistem tangga nada pentatonis (slendro dan pelog) yang berbeda dari tangga nada diatonis Barat, menciptakan karakter suara yang khas dan menjadi dasar dari banyak genre musik fusion kontemporer Indonesia.',
        metadata: { category: 'dataset', domain: 'general', agent: 'SeniBudaya', topic: 'gamelan', tags: ['musik tradisional', 'budaya'] }
    },

    
    {
        text: 'Latihan interval intensitas tinggi terbukti lebih efisien meningkatkan kapasitas kardiovaskular dalam waktu singkat dibanding latihan kardio intensitas rendah berdurasi panjang, meski keduanya punya manfaat kesehatan yang saling melengkapi.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Olahraga', topic: 'latihan interval', tags: ['sains olahraga', 'kebugaran'] }
    },
    {
        text: 'Bulu tangkis menjadi cabang olahraga dengan prestasi internasional paling konsisten bagi Indonesia, didukung oleh sistem pembinaan usia dini yang terstruktur di klub-klub daerah sebelum atlet naik ke pelatnas.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Olahraga', topic: 'bulu tangkis indonesia', tags: ['olahraga indonesia', 'pembinaan atlet'] }
    },
    {
        text: 'Pemulihan pasca-latihan sama pentingnya dengan latihan itu sendiri — tidur cukup, asupan protein yang memadai, dan hari istirahat terjadwal mencegah cedera berlebih yang justru menghambat peningkatan performa jangka panjang.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Olahraga', topic: 'pemulihan atlet', tags: ['sains olahraga', 'kesehatan'] }
    },

    
    {
        text: 'Pembelajaran aktif yang melibatkan diskusi, praktik, dan pemecahan masalah terbukti menghasilkan retensi pengetahuan yang jauh lebih tinggi dibanding metode ceramah pasif, sesuai dengan piramida pembelajaran yang menekankan keterlibatan langsung siswa.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Pendidikan', topic: 'pembelajaran aktif', tags: ['pedagogi', 'metode belajar'] }
    },
    {
        text: 'Kesenjangan akses pendidikan digital antara wilayah perkotaan dan pedesaan di Indonesia tetap menjadi tantangan utama pemerataan pendidikan, di mana ketersediaan internet dan perangkat menjadi faktor penentu kualitas belajar jarak jauh.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Pendidikan', topic: 'kesenjangan digital', tags: ['pendidikan digital', 'pemerataan'] }
    },
    {
        text: 'Kurikulum yang berbasis proyek mendorong siswa menerapkan pengetahuan lintas mata pelajaran untuk memecahkan masalah nyata, membangun keterampilan berpikir kritis yang lebih relevan dibanding sekadar menghafal fakta terisolasi.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Pendidikan', topic: 'pembelajaran berbasis proyek', tags: ['kurikulum', 'keterampilan abad 21'] }
    },

    
    {
        text: 'Konsep toleransi beragama di Indonesia tercermin dalam semboyan Bhinneka Tunggal Ika, yang mengakui keberagaman keyakinan sebagai kekuatan bangsa, bukan sumber perpecahan, selama nilai kemanusiaan universal tetap dijunjung bersama.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Agama', topic: 'toleransi beragama', tags: ['kerukunan', 'pluralisme'] }
    },
    {
        text: 'Ibadah puasa dalam berbagai tradisi keagamaan, selain dimensi spiritualnya, juga mengajarkan disiplin diri, empati terhadap yang kekurangan, dan pengendalian hawa nafsu yang manfaatnya dirasakan lintas aspek kehidupan sehari-hari.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Agama', topic: 'makna puasa', tags: ['spiritualitas', 'ibadah'] }
    },
    {
        text: 'Dialog antaragama yang sehat dibangun di atas kesediaan mendengarkan perspektif berbeda tanpa harus menyetujuinya, menumbuhkan rasa saling menghormati yang menjadi fondasi kerukunan sosial di masyarakat majemuk.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Agama', topic: 'dialog antaragama', tags: ['kerukunan', 'dialog'] }
    },

    
    {
        text: 'Sistem pertanian terpadu yang menggabungkan tanaman pangan, peternakan, dan perikanan dalam satu lahan meningkatkan efisiensi sumber daya karena limbah dari satu komponen bisa menjadi input bagi komponen lainnya, misalnya kotoran ternak sebagai pupuk organik.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Pertanian', topic: 'pertanian terpadu', tags: ['agroekosistem', 'keberlanjutan'] }
    },
    {
        text: 'Teknologi pertanian presisi menggunakan sensor dan data untuk menentukan kebutuhan air dan pupuk secara spesifik per petak lahan, mengurangi pemborosan input sekaligus meningkatkan hasil panen dibanding pendekatan seragam untuk seluruh lahan.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Pertanian', topic: 'pertanian presisi', tags: ['agritech', 'efisiensi'] }
    },
    {
        text: 'Diversifikasi tanaman melindungi petani dari risiko gagal panen tunggal akibat hama atau perubahan harga pasar, sekaligus menjaga kesuburan tanah karena pola tanam yang bergilir mencegah penipisan hara jenis tertentu secara terus-menerus.',
        metadata: { category: 'dataset', domain: 'general', agent: 'Pertanian', topic: 'diversifikasi tanaman', tags: ['manajemen risiko', 'kesuburan tanah'] }
    },

    
    {
        text: 'Arsitektur microservices memecah aplikasi besar menjadi layanan-layanan kecil yang independen, memudahkan tim mengembangkan dan menskalakan bagian tertentu tanpa harus menyentuh keseluruhan sistem, meski menambah kompleksitas koordinasi antar-layanan.',
        metadata: { category: 'dataset', domain: 'general', agent: 'TeknologiInformasi', topic: 'arsitektur microservices', tags: ['arsitektur perangkat lunak', 'skalabilitas'] }
    },
    {
        text: 'Keamanan siber yang efektif menerapkan prinsip pertahanan berlapis — autentikasi kuat, enkripsi data, pembaruan berkala, dan pemantauan aktif — karena mengandalkan satu lapisan keamanan tunggal menciptakan titik kegagalan tunggal yang berisiko.',
        metadata: { category: 'dataset', domain: 'general', agent: 'TeknologiInformasi', topic: 'pertahanan berlapis', tags: ['keamanan siber', 'infrastruktur it'] }
    },
    {
        text: 'Transformasi digital yang berhasil bukan sekadar mengganti proses manual dengan aplikasi, melainkan merombak cara kerja organisasi agar benar-benar memanfaatkan kecepatan dan data yang disediakan teknologi baru.',
        metadata: { category: 'dataset', domain: 'general', agent: 'TeknologiInformasi', topic: 'transformasi digital', tags: ['digitalisasi', 'manajemen perubahan'] }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('DatasetGeneral', 'Loaded ' + data.length + ' entri dataset pengetahuan umum');
}
