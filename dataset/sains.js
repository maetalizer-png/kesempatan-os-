// KESEMPATAN OS - DATASET: SAINS & TEKNIK
// Selaras dengan 14 agent di agents/agent-science.js. Lihat dataset/bisnis.js
// untuk catatan desain lengkap folder ini.
const data = [
    // ================= MATEMATIKA =================
    {
        text: 'Bilangan prima adalah fondasi kriptografi modern — algoritma seperti RSA mengandalkan kesulitan memfaktorkan bilangan besar hasil perkalian dua bilangan prima, sebuah masalah yang secara komputasi sangat berat untuk dipecahkan tanpa kunci yang tepat.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Matematika', topic: 'bilangan prima dan kriptografi', tags: ['teori bilangan', 'kriptografi'] }
    },
    {
        text: 'Kalkulus diferensial mengukur laju perubahan sesaat suatu fungsi, sementara kalkulus integral mengukur akumulasi total dari perubahan itu — keduanya saling berkebalikan sesuai teorema dasar kalkulus yang menghubungkan turunan dan integral.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Matematika', topic: 'kalkulus diferensial dan integral', tags: ['kalkulus', 'analisis matematika'] }
    },
    {
        text: 'Teori probabilitas membedakan antara peluang bersyarat dan peluang gabungan — kekeliruan mengabaikan syarat ini, dikenal sebagai kekeliruan penuntut umum, sering menyebabkan kesalahan penalaran fatal dalam analisis statistik dan hukum.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Matematika', topic: 'probabilitas bersyarat', tags: ['statistik', 'probabilitas'] }
    },

    // ================= BIOLOGI =================
    {
        text: 'Seleksi alam bekerja pada variasi genetik yang sudah ada dalam populasi — individu dengan sifat yang lebih menguntungkan untuk bertahan dan bereproduksi di lingkungan tertentu cenderung mewariskan sifat itu lebih banyak ke generasi berikutnya.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Biologi', topic: 'seleksi alam', tags: ['evolusi', 'genetika populasi'] }
    },
    {
        text: 'Fotosintesis mengubah energi cahaya matahari, karbon dioksida, dan air menjadi glukosa dan oksigen melalui reaksi terang di membran tilakoid dan reaksi gelap di stroma kloroplas, menjadi dasar hampir seluruh rantai makanan di bumi.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Biologi', topic: 'fotosintesis', tags: ['biologi sel', 'ekologi'] }
    },
    {
        text: 'Keanekaragaman hayati suatu ekosistem berkorelasi dengan ketahanannya terhadap gangguan — ekosistem dengan banyak spesies punya lebih banyak jalur redundan sehingga hilangnya satu spesies tidak langsung meruntuhkan seluruh jaring makanan.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Biologi', topic: 'keanekaragaman hayati', tags: ['ekologi', 'konservasi'] }
    },

    // ================= FISIKA =================
    {
        text: 'Hukum kekekalan energi menyatakan energi tidak bisa diciptakan atau dimusnahkan, hanya berubah bentuk — prinsip ini menjadi dasar analisis semua sistem fisis, dari mesin sederhana hingga reaktor nuklir yang mengubah massa menjadi energi.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Fisika', topic: 'kekekalan energi', tags: ['fisika klasik', 'termodinamika'] }
    },
    {
        text: 'Mekanika kuantum menunjukkan bahwa partikel subatomik berperilaku seperti gelombang sekaligus partikel, dan posisi pastinya hanya bisa dijelaskan dalam bentuk probabilitas sampai diamati — sebuah gagasan yang bertentangan dengan intuisi fisika klasik sehari-hari.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Fisika', topic: 'dualitas gelombang partikel', tags: ['mekanika kuantum', 'fisika modern'] }
    },
    {
        text: 'Teori relativitas umum Einstein menjelaskan gravitasi bukan sebagai gaya, melainkan sebagai lengkungan ruang-waktu akibat massa dan energi — objek masif seperti bintang membengkokkan jalur cahaya di sekitarnya, fenomena yang telah dibuktikan lewat pengamatan lensa gravitasi.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Fisika', topic: 'relativitas umum', tags: ['fisika modern', 'gravitasi'] }
    },

    // ================= SAINS (umum) =================
    {
        text: 'Metode ilmiah dimulai dari observasi, perumusan hipotesis yang bisa diuji, eksperimen terkontrol, dan analisis hasil — sebuah hipotesis yang tidak bisa difalsifikasi lewat eksperimen apa pun tidak dianggap sebagai klaim ilmiah yang valid.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Sains', topic: 'metode ilmiah', tags: ['filsafat sains', 'metodologi'] }
    },
    {
        text: 'Replikasi hasil eksperimen oleh peneliti independen adalah pilar kredibilitas ilmiah — krisis replikasi di berbagai bidang menunjukkan bahwa temuan yang hanya diuji sekali, terutama dengan sampel kecil, perlu diperlakukan dengan hati-hati sebelum dianggap fakta mapan.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Sains', topic: 'krisis replikasi', tags: ['filsafat sains', 'integritas riset'] }
    },
    {
        text: 'Interdisiplinaritas semakin penting dalam sains modern karena masalah kompleks seperti perubahan iklim membutuhkan gabungan pengetahuan fisika atmosfer, kimia, biologi, ekonomi, dan kebijakan publik yang tidak bisa dipecahkan satu disiplin ilmu saja.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Sains', topic: 'interdisiplinaritas', tags: ['filsafat sains', 'kolaborasi ilmiah'] }
    },

    // ================= ASTRONOMI =================
    {
        text: 'Bintang menghasilkan energinya melalui fusi nuklir yang mengubah hidrogen menjadi helium di intinya — ketika bahan bakar hidrogen habis, nasib akhir bintang bergantung pada massanya, mulai dari katai putih hingga lubang hitam untuk bintang paling masif.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Astronomi', topic: 'siklus hidup bintang', tags: ['astrofisika', 'evolusi bintang'] }
    },
    {
        text: 'Pergeseran merah cahaya dari galaksi jauh menjadi bukti utama bahwa alam semesta terus mengembang — semakin jauh sebuah galaksi, semakin cepat ia menjauh dari kita, sebuah pola yang pertama kali diamati Edwin Hubble pada tahun 1929.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Astronomi', topic: 'pergeseran merah dan ekspansi alam semesta', tags: ['kosmologi', 'astrofisika'] }
    },
    {
        text: 'Zona layak huni di sekitar sebuah bintang adalah rentang jarak di mana air bisa berbentuk cair di permukaan planet — kriteria ini menjadi salah satu faktor utama pencarian planet ekstrasurya yang berpotensi mendukung kehidupan.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Astronomi', topic: 'zona layak huni', tags: ['eksoplanet', 'astrobiologi'] }
    },

    // ================= KEDOKTERAN =================
    {
        text: 'Resistensi antibiotik terjadi ketika bakteri berevolusi mengembangkan mekanisme pertahanan terhadap obat akibat penggunaan yang berlebihan atau tidak tuntas — fenomena ini menjadi salah satu ancaman kesehatan global paling serius di abad ini.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Kedokteran', topic: 'resistensi antibiotik', tags: ['mikrobiologi', 'kesehatan masyarakat'] }
    },
    {
        text: 'Sistem imun tubuh bekerja lewat dua lini pertahanan — imunitas bawaan yang merespons cepat tapi tidak spesifik, dan imunitas adaptif yang lebih lambat terbentuk tapi mampu mengenali patogen spesifik serta menciptakan memori jangka panjang lewat vaksinasi.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Kedokteran', topic: 'sistem imun', tags: ['imunologi', 'vaksinasi'] }
    },
    {
        text: 'Pencegahan penyakit tidak menular seperti diabetes dan hipertensi jauh lebih efektif secara biaya dibanding pengobatan setelah komplikasi muncul, sehingga deteksi dini lewat skrining rutin menjadi strategi kesehatan masyarakat yang krusial.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Kedokteran', topic: 'pencegahan penyakit tidak menular', tags: ['kesehatan masyarakat', 'pencegahan'] }
    },

    // ================= TEKNIK =================
    {
        text: 'Faktor keamanan dalam desain struktur bangunan memastikan konstruksi mampu menahan beban jauh melampaui beban maksimum yang diperkirakan, mengantisipasi ketidakpastian material, kesalahan konstruksi, dan kondisi ekstrem yang tidak terduga.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Teknik', topic: 'faktor keamanan struktur', tags: ['teknik sipil', 'keselamatan'] }
    },
    {
        text: 'Efisiensi termal mesin pembakaran dalam dibatasi secara teoretis oleh siklus Carnot, yang menunjukkan bahwa tidak ada mesin panas yang bisa mengubah 100% energi panas menjadi kerja mekanik akibat hukum kedua termodinamika.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Teknik', topic: 'efisiensi termal', tags: ['teknik mesin', 'termodinamika'] }
    },
    {
        text: 'Desain sistem yang toleran terhadap kegagalan mengasumsikan bahwa komponen individual pasti akan gagal cepat atau lambat, sehingga kegagalan satu bagian tidak boleh menyebabkan keruntuhan total keseluruhan sistem.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Teknik', topic: 'toleransi kegagalan', tags: ['rekayasa sistem', 'keandalan'] }
    },

    // ================= KIMIA =================
    {
        text: 'Ikatan kovalen terbentuk ketika dua atom berbagi pasangan elektron untuk mencapai konfigurasi elektron yang stabil, berbeda dengan ikatan ion yang terbentuk dari transfer elektron penuh antara atom bermuatan berlawanan.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Kimia', topic: 'ikatan kovalen vs ion', tags: ['kimia dasar', 'struktur molekul'] }
    },
    {
        text: 'Katalis mempercepat laju reaksi kimia dengan menurunkan energi aktivasi yang dibutuhkan tanpa ikut terkonsumsi dalam reaksi itu sendiri — prinsip ini menjadi dasar sebagian besar proses industri kimia modern demi efisiensi energi.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Kimia', topic: 'katalis', tags: ['kinetika kimia', 'industri kimia'] }
    },
    {
        text: 'Skala pH mengukur konsentrasi ion hidrogen dalam larutan secara logaritmik, sehingga setiap penurunan satu angka pH berarti konsentrasi keasaman meningkat sepuluh kali lipat — inilah mengapa perubahan pH kecil bisa berdampak besar pada sistem biologis.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Kimia', topic: 'skala ph', tags: ['kimia larutan', 'asam basa'] }
    },

    // ================= ROBOTIKA =================
    {
        text: 'Kontrol umpan balik dalam robotika menggunakan sensor untuk terus memantau kondisi aktual dan menyesuaikan gerakan aktuator secara real-time, memungkinkan robot beradaptasi terhadap gangguan lingkungan yang tidak bisa diprediksi sebelumnya.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Robotika', topic: 'kontrol umpan balik', tags: ['sistem kontrol', 'robotika'] }
    },
    {
        text: 'Kinematika terbalik menghitung sudut sendi yang dibutuhkan lengan robot untuk mencapai posisi ujung tertentu di ruang tiga dimensi — perhitungan ini jauh lebih kompleks secara matematis dibanding kinematika maju yang menghitung posisi dari sudut sendi yang sudah diketahui.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Robotika', topic: 'kinematika terbalik', tags: ['robotika', 'kontrol gerak'] }
    },
    {
        text: 'Robot kolaboratif (cobot) dirancang untuk bekerja berdampingan langsung dengan manusia di ruang kerja yang sama, dilengkapi sensor keamanan yang menghentikan gerakan otomatis begitu mendeteksi kontak tak terduga dengan operator manusia.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Robotika', topic: 'robot kolaboratif', tags: ['robotika industri', 'keselamatan kerja'] }
    },

    // ================= CODING =================
    {
        text: 'Kompleksitas algoritma yang dinyatakan dalam notasi Big O menggambarkan bagaimana waktu eksekusi atau kebutuhan memori tumbuh seiring bertambahnya ukuran input — algoritma dengan kompleksitas O(n log n) jauh lebih skalabel dibanding O(n²) untuk data besar.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Coding', topic: 'kompleksitas algoritma', tags: ['ilmu komputer', 'struktur data'] }
    },
    {
        text: 'Kode yang mudah dirawat lebih mengutamakan keterbacaan daripada kepintaran yang berlebihan — nama variabel yang jelas dan fungsi yang melakukan satu tanggung jawab tunggal jauh lebih berharga jangka panjang dibanding trik singkat yang sulit dipahami orang lain.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Coding', topic: 'keterbacaan kode', tags: ['rekayasa perangkat lunak', 'praktik terbaik'] }
    },
    {
        text: 'Pengujian unit yang baik mengisolasi satu unit kode dari dependensinya menggunakan mock atau stub, sehingga kegagalan tes bisa langsung menunjuk ke lokasi masalah yang spesifik, bukan sekadar tahu bahwa "ada sesuatu yang salah" di sistem besar.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Coding', topic: 'pengujian unit', tags: ['rekayasa perangkat lunak', 'testing'] }
    },

    // ================= CYBER (Keamanan Siber) =================
    {
        text: 'Serangan phishing tetap menjadi vektor serangan siber paling umum karena menargetkan kelemahan manusia, bukan kelemahan teknis — pelatihan kesadaran keamanan bagi karyawan sering lebih efektif dibanding investasi tambahan pada perangkat keamanan teknis semata.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Cyber', topic: 'phishing', tags: ['keamanan siber', 'rekayasa sosial'] }
    },
    {
        text: 'Prinsip least privilege dalam keamanan sistem membatasi setiap pengguna atau proses hanya memiliki akses minimum yang dibutuhkan untuk menjalankan tugasnya, sehingga jika satu akun disusupi, kerusakan yang bisa ditimbulkan tetap terbatas.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Cyber', topic: 'least privilege', tags: ['keamanan siber', 'kontrol akses'] }
    },
    {
        text: 'Enkripsi ujung ke ujung memastikan hanya pengirim dan penerima yang bisa membaca isi komunikasi, karena data dienkripsi di perangkat pengirim dan baru didekripsi di perangkat penerima, sehingga bahkan penyedia layanan di tengah tidak bisa mengakses isi pesan.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Cyber', topic: 'enkripsi ujung ke ujung', tags: ['keamanan siber', 'kriptografi'] }
    },

    // ================= ILMU KOMPUTER =================
    {
        text: 'Masalah P versus NP adalah salah satu pertanyaan terbuka paling penting dalam ilmu komputer teoretis — ia mempertanyakan apakah setiap masalah yang solusinya mudah diverifikasi juga pasti mudah dipecahkan, sebuah pertanyaan yang berdampak luas pada kriptografi dan optimasi.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'IlmuKomputer', topic: 'p versus np', tags: ['teori komputasi', 'kompleksitas'] }
    },
    {
        text: 'Struktur data pohon biner terurut memungkinkan operasi pencarian, penyisipan, dan penghapusan dalam waktu logaritmik rata-rata, jauh lebih efisien dibanding pencarian linier pada array untuk kumpulan data besar yang sering diperbarui.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'IlmuKomputer', topic: 'pohon biner terurut', tags: ['struktur data', 'algoritma'] }
    },
    {
        text: 'Jaringan saraf tiruan dalam pembelajaran mesin terinspirasi dari struktur neuron biologis, di mana setiap lapisan mengekstrak fitur yang semakin abstrak dari data mentah — inilah dasar dari terobosan pengenalan gambar dan pemrosesan bahasa modern.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'IlmuKomputer', topic: 'jaringan saraf tiruan', tags: ['machine learning', 'kecerdasan buatan'] }
    },

    // ================= ARSITEKTUR =================
    {
        text: 'Arsitektur berkelanjutan mengoptimalkan orientasi bangunan, ventilasi alami, dan material lokal untuk mengurangi kebutuhan energi buatan — pendekatan pasif ini sering lebih efektif jangka panjang dibanding sekadar menambahkan panel surya pada desain yang boros energi.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Arsitektur', topic: 'arsitektur berkelanjutan', tags: ['arsitektur hijau', 'efisiensi energi'] }
    },
    {
        text: 'Arsitektur tropis Nusantara tradisional, seperti rumah panggung dengan atap tinggi dan bukaan lebar, dirancang secara empiris untuk mengatasi kelembapan dan panas tinggi — prinsip ini kini kembali relevan dalam desain bangunan hemat energi modern.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Arsitektur', topic: 'arsitektur tropis nusantara', tags: ['arsitektur vernakular', 'iklim tropis'] }
    },
    {
        text: 'Prinsip form follows function menyatakan bahwa bentuk sebuah bangunan seharusnya ditentukan oleh tujuan fungsionalnya, bukan semata pertimbangan estetika — prinsip ini menjadi dasar gerakan arsitektur modernis di awal abad ke-20.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Arsitektur', topic: 'form follows function', tags: ['teori arsitektur', 'modernisme'] }
    },

    // ================= STATISTIKA =================
    {
        text: 'Nilai p dalam uji hipotesis mengukur seberapa besar kemungkinan hasil yang diamati (atau lebih ekstrem) muncul semata karena kebetulan jika hipotesis nol benar — nilai p kecil bukan berarti hipotesis penelitian pasti benar, hanya bahwa data tidak konsisten dengan hipotesis nol.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Statistika', topic: 'nilai p', tags: ['statistik inferensial', 'uji hipotesis'] }
    },
    {
        text: 'Paradoks Simpson menunjukkan bahwa tren yang muncul di beberapa kelompok data bisa hilang atau bahkan berbalik arah ketika kelompok-kelompok itu digabungkan — fenomena ini menegaskan pentingnya memeriksa data pada tingkat granularitas yang tepat sebelum menarik kesimpulan.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Statistika', topic: 'paradoks simpson', tags: ['statistik', 'analisis data'] }
    },
    {
        text: 'Interval kepercayaan memberikan rentang nilai yang mencerminkan ketidakpastian estimasi statistik, bukan sekadar satu angka tunggal — interval kepercayaan 95% berarti jika penelitian diulang berkali-kali, sekitar 95% dari interval yang dihasilkan akan mencakup nilai populasi sebenarnya.',
        metadata: { category: 'dataset', domain: 'sains', agent: 'Statistika', topic: 'interval kepercayaan', tags: ['statistik inferensial', 'estimasi'] }
    }
];

export const DATA = data;

if (window.InternalLogger) {
    window.InternalLogger.info('DatasetSains', 'Loaded ' + data.length + ' entri dataset sains & teknik');
}
