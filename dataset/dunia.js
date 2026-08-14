const data = [
    {
        text: 'Nigeria - Negara terbesar di Afrika dengan ekonomi dan populasi terbesar. Ibu kota: Abuja. Populasi: 220 juta jiwa. Mata uang: Naira (NGN). Bahasa: Inggris. Sistem pemerintahan: Republik Federal Presidensial. Anggota PBB, AU, dan OPEC. Rumah bagi Nollywood, industri film terbesar kedua di dunia. Ekonomi terbesar di Afrika dengan minyak, fintech, dan startup berkembang pesat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Nigeria', tags: ['geografi', 'negara', 'african-barat', 'West Africa'], region: 'african-barat', capital: 'Abuja' }
    },
    {
        text: 'Ghana - Negara di Afrika Barat dengan ekonomi stabil dan budaya. Ibu kota: Accra. Populasi: 33 juta jiwa. Mata uang: Cedi (GHS). Bahasa: Inggris. Sistem pemerintahan: Republik Presidensial. Anggota PBB, AU, dan Commonwealth. Negara dengan kakao, emas, dan minyak. Demokrasi stabil dan pertumbuhan ekonomi yang baik.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Ghana', tags: ['geografi', 'negara', 'african-barat', 'West Africa'], region: 'african-barat', capital: 'Accra' }
    },
    {
        text: 'Pantai Gading - Negara di Afrika Barat dengan ekonomi pertanian. Ibu kota: Yamoussoukro. Populasi: 27 juta jiwa. Mata uang: Franc CFA (XOF). Bahasa: Prancis. Sistem pemerintahan: Republik Presidensial. Negara dengan kakao terbesar di dunia dan ekonomi pertanian yang maju.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Pantai Gading', tags: ['geografi', 'negara', 'african-barat', 'West Africa'], region: 'african-barat', capital: 'Yamoussoukro' }
    },
    {
        text: 'Senegal - Negara di Afrika Barat dengan demokrasi stabil. Ibu kota: Dakar. Populasi: 18 juta jiwa. Mata uang: Franc CFA (XOF). Bahasa: Prancis. Sistem pemerintahan: Republik Presidensial. Negara dengan demokrasi stabil dan pariwisata maju. Rumah bagi Danau Retba (Danau Pink) dan pulau Gorée.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Senegal', tags: ['geografi', 'negara', 'african-barat', 'West Africa'], region: 'african-barat', capital: 'Dakar' }
    },
    {
        text: 'Mali - Negara di Afrika Barat dengan sejarah dan budaya. Ibu kota: Bamako. Populasi: 23 juta jiwa. Mata uang: Franc CFA (XOF). Bahasa: Prancis. Sistem pemerintahan: Republik Semi-Presidensial. Rumah bagi Timbuktu dan sejarah Kekaisaran Mali yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mali', tags: ['geografi', 'negara', 'african-barat', 'West Africa'], region: 'african-barat', capital: 'Bamako' }
    },
    {
        text: 'Afrika Selatan - Negara paling selatan di Afrika dengan ekonomi maju. Ibu kota: Pretoria. Populasi: 60 juta jiwa. Mata uang: Rand (ZAR). Bahasa: 11 bahasa resmi. Sistem pemerintahan: Republik Parlementer. Anggota G20, BRICS, dan AU. Negara dengan tambang emas, platinum, dan berlian terbesar di dunia. Rumah bagi Table Mountain, Cape Town, dan Safari Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Afrika Selatan', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Pretoria' }
    },
    {
        text: 'Namibia - Negara di Afrika Selatan dengan gurun Namib dan tambang. Ibu kota: Windhoek. Populasi: 2.5 juta jiwa. Mata uang: Dolar Namibia (NAD). Bahasa: Inggris. Sistem pemerintahan: Republik Semi-Presidensial. Rumah bagi gurun Namib tertua di dunia dan keanekaragaman hayati unik.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Namibia', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Windhoek' }
    },
    {
        text: 'Botswana - Negara di Afrika Selatan dengan ekonomi stabil dan intan. Ibu kota: Gaborone. Populasi: 2.4 juta jiwa. Mata uang: Pula (BWP). Bahasa: Inggris, Setswana. Sistem pemerintahan: Republik Parlementer. Negara dengan ekonomi paling stabil di Afrika dan Delta Okavango yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Botswana', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Gaborone' }
    },
    {
        text: 'Zambia - Negara di Afrika Selatan dengan tambang tembaga dan Victoria Falls. Ibu kota: Lusaka. Populasi: 20 juta jiwa. Mata uang: Kwacha (ZMW). Bahasa: Inggris. Sistem pemerintahan: Republik Presidensial. Rumah bagi Air Terjun Victoria dan tambang tembaga terbesar di Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Zambia', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Lusaka' }
    },
    {
        text: 'Zimbabwe - Negara di Afrika Selatan dengan Victoria Falls dan pertanian. Ibu kota: Harare. Populasi: 16 juta jiwa. Mata uang: Dolar Zimbabwe (ZWL). Bahasa: Inggris, Shona, Ndebele. Sistem pemerintahan: Republik Presidensial. Negara dengan Victoria Falls dan reruntuhan Great Zimbabwe.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Zimbabwe', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Harare' }
    },
    {
        text: 'Eswatini - Kerajaan di Afrika Selatan dengan budaya Swazi. Ibu kota: Mbabane. Populasi: 1.1 juta jiwa. Mata uang: Lilangeni (SZL). Bahasa: Swazi, Inggris. Sistem pemerintahan: Monarki Absolut. Satu-satunya monarki absolut di Afrika. Kaya akan hutan dan pertanian.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Eswatini', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Mbabane' }
    },
    {
        text: 'Lesotho - Kerajaan di Afrika Selatan yang terkepung oleh Afrika Selatan. Ibu kota: Maseru. Populasi: 2.1 juta jiwa. Mata uang: Loti (LSL). Bahasa: Sesotho, Inggris. Sistem pemerintahan: Monarki Konstitusional. Satu-satunya negara di Afrika yang terletak di atas 1000 meter. Kaya akan air dan tekstil.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Lesotho', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Maseru' }
    },
    {
        text: 'Mozambik - Negara di Afrika Selatan dengan pesisir Samudra Hindia. Ibu kota: Maputo. Populasi: 33 juta jiwa. Mata uang: Metical (MZN). Bahasa: Portugis. Sistem pemerintahan: Republik Presidensial. Anggota PBB, AU, dan SADC. Kaya gas alam, batu bara, dan pariwisata. Rumah bagi kepulauan Bazaruto dan pantai-pantai indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mozambik', tags: ['geografi', 'negara', 'african-selatan', 'South Africa'], region: 'african-selatan', capital: 'Maputo' }
    },
    {
        text: 'Kongo - Negara di Afrika Tengah dengan hutan hujan Amazon. Ibu kota: Kinshasa. Populasi: 95 juta jiwa. Mata uang: Franc (CDF). Bahasa: Prancis. Sistem pemerintahan: Republik Semi-Presidensial. Negara dengan hutan hujan terbesar kedua di dunia dan sumber daya mineral melimpah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kongo', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'Kinshasa' }
    },
    {
        text: 'Angola - Negara di Afrika Tengah dengan minyak dan berlian. Ibu kota: Luanda. Populasi: 35 juta jiwa. Mata uang: Kwanza (AOA). Bahasa: Portugis. Sistem pemerintahan: Republik Presidensial. Negara dengan ekonomi minyak terbesar di Afrika dan pertumbuhan yang cepat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Angola', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'Luanda' }
    },
    {
        text: 'Gabon - Negara di Afrika Tengah dengan hutan dan minyak. Ibu kota: Libreville. Populasi: 2.2 juta jiwa. Mata uang: Franc CFA (XAF). Bahasa: Prancis. Sistem pemerintahan: Republik Presidensial. Negara dengan hutan hujan dan keanekaragaman hayati yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Gabon', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'Libreville' }
    },
    {
        text: 'Chad - Negara di Afrika Tengah dengan gurun Sahara. Ibu kota: N\'Djamena. Populasi: 17 juta jiwa. Mata uang: Franc CFA (XAF). Bahasa: Prancis, Arab. Sistem pemerintahan: Republik Presidensial. Negara dengan gurun Sahara dan Danau Chad yang bersejarah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Chad', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'N\'Djamena' }
    },
    {
        text: 'Republik Afrika Tengah - Negara di Afrika Tengah dengan hutan dan mineral. Ibu kota: Bangui. Populasi: 5.4 juta jiwa. Mata uang: Franc CFA (XAF). Bahasa: Prancis, Sango. Sistem pemerintahan: Republik Presidensial. Negara dengan keanekaragaman hayati dan sumber daya mineral.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Republik Afrika Tengah', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'Bangui' }
    },
    {
        text: 'Kamerun - Negara di Afrika Tengah dengan keanekaragaman budaya. Ibu kota: Yaoundé. Populasi: 27 juta jiwa. Mata uang: Franc CFA (XAF). Bahasa: Inggris, Prancis. Sistem pemerintahan: Republik Presidensial. Sering disebut "Afrika Mini" karena keanekaragaman hayati dan budaya yang luar biasa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kamerun', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'Yaoundé' }
    },
    {
        text: 'Guinea Khatulistiwa - Negara di Afrika Tengah dengan minyak dan hutan. Ibu kota: Malabo. Populasi: 1.4 juta jiwa. Mata uang: Franc CFA (XAF). Bahasa: Spanyol, Prancis. Sistem pemerintahan: Republik Presidensial. Negara dengan pendapatan per kapita tertinggi di Afrika dan keanekaragaman hayati.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Guinea Khatulistiwa', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'Malabo' }
    },
    {
        text: 'São Tomé dan Príncipe - Negara kepulauan di Afrika Tengah. Ibu kota: São Tomé. Populasi: 220 ribu jiwa. Mata uang: Dobra (STN). Bahasa: Portugis. Sistem pemerintahan: Republik Semi-Presidensial. Negara dengan keanekaragaman hayati dan ekowisata yang luar biasa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'São Tomé dan Príncipe', tags: ['geografi', 'negara', 'african-tengah', 'Central Africa'], region: 'african-tengah', capital: 'São Tomé' }
    },
    {
        text: 'Etiopia - Negara di Afrika Timur dengan peradaban kuno dan ekonomi tumbuh. Ibu kota: Addis Ababa. Populasi: 120 juta jiwa. Mata uang: Birr (ETB). Bahasa: Amharik. Sistem pemerintahan: Republik Federal Parlementer. Markas besar Uni Afrika. Negara dengan sejarah panjang dan pertumbuhan ekonomi tercepat di Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Etiopia', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Addis Ababa' }
    },
    {
        text: 'Kenya - Negara di Afrika Timur dengan ekonomi digital dan pariwisata. Ibu kota: Nairobi. Populasi: 55 juta jiwa. Mata uang: Shilling (KES). Bahasa: Swahili, Inggris. Sistem pemerintahan: Republik Presidensial. Pusat fintech, M-Pesa, dan safari. Rumah bagi Taman Nasional Masai Mara dan Gunung Kenya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kenya', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Nairobi' }
    },
    {
        text: 'Tanzania - Negara di Afrika Timur dengan alam dan pariwisata. Ibu kota: Dodoma. Populasi: 65 juta jiwa. Mata uang: Shilling (TZS). Bahasa: Swahili, Inggris. Sistem pemerintahan: Republik Presidensial. Rumah bagi Gunung Kilimanjaro, Serengeti, dan Zanzibar. Destinasi wisata alam terbaik di Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tanzania', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Dodoma' }
    },
    {
        text: 'Uganda - Negara di Afrika Timur dengan pertanian dan danau Victoria. Ibu kota: Kampala. Populasi: 48 juta jiwa. Mata uang: Shilling (UGX). Bahasa: Inggris, Swahili. Sistem pemerintahan: Republik Presidensial. Negara dengan danau Victoria dan sumber sungai Nil. Pertanian dan kopi menjadi andalan ekonomi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Uganda', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Kampala' }
    },
    {
        text: 'Somalia - Negara di Afrika Timur dengan pesisir panjang. Ibu kota: Mogadishu. Populasi: 16 juta jiwa. Mata uang: Shilling (SOS). Bahasa: Somalia, Arab. Sistem pemerintahan: Republik Federal. Lokasi strategis di Tanduk Afrika. Negara dengan pesisir terpanjang di Afrika daratan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Somalia', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Mogadishu' }
    },
    {
        text: 'Rwanda - Negara di Afrika Timur dengan ekonomi digital dan pemulihan. Ibu kota: Kigali. Populasi: 13 juta jiwa. Mata uang: Franc (RWF). Bahasa: Kinyarwanda, Inggris, Prancis. Sistem pemerintahan: Republik Presidensial. Negara dengan pemulihan ekonomi tercepat di Afrika dan teknologi digital.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Rwanda', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Kigali' }
    },
    {
        text: 'Madagaskar - Negara kepulauan di Afrika Timur dengan keanekaragaman hayati. Ibu kota: Antananarivo. Populasi: 28 juta jiwa. Mata uang: Ariary (MGA). Bahasa: Malagasi, Prancis. Sistem pemerintahan: Republik Semi-Presidensial. Rumah bagi lemur dan keanekaragaman hayati unik. 90% spesies hanya ada di Madagaskar.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Madagaskar', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Antananarivo' }
    },
    {
        text: 'Eritrea - Negara di Afrika Timur dengan pesisir Laut Merah. Ibu kota: Asmara. Populasi: 3.6 juta jiwa. Mata uang: Nakfa (ERN). Bahasa: Tigrinya, Arab. Sistem pemerintahan: Republik. Negara dengan pesisir Laut Merah dan arsitektur kolonial Italia yang unik.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Eritrea', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Asmara' }
    },
    {
        text: 'Djibouti - Negara di Afrika Timur dengan pelabuhan strategis. Ibu kota: Djibouti. Populasi: 1 juta jiwa. Mata uang: Franc (DJF). Bahasa: Prancis, Arab. Sistem pemerintahan: Republik Presidensial. Negara dengan pelabuhan strategis di Laut Merah dan pangkalan militer asing.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Djibouti', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Djibouti' }
    },
    {
        text: 'Sudan Selatan - Negara termuda di Afrika Timur dengan sumber daya minyak. Ibu kota: Juba. Populasi: 11 juta jiwa. Mata uang: Pound (SSP). Bahasa: Inggris. Sistem pemerintahan: Republik Presidensial. Negara termuda di Afrika (merdeka 2011) dengan cadangan minyak besar.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Sudan Selatan', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Juba' }
    },
    {
        text: 'Burundi - Negara di Afrika Timur dengan danau Tanganyika. Ibu kota: Gitega. Populasi: 12 juta jiwa. Mata uang: Franc (BIF). Bahasa: Kirundi, Prancis. Sistem pemerintahan: Republik Presidensial. Negara dengan Danau Tanganyika dan pertanian subur.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Burundi', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Gitega' }
    },
    {
        text: 'Malawi - Negara di Afrika Timur dengan Danau Malawi. Ibu kota: Lilongwe. Populasi: 20 juta jiwa. Mata uang: Kwacha (MWK). Bahasa: Inggris, Chichewa. Sistem pemerintahan: Republik Presidensial. Negara dengan Danau Malawi dan keindahan alam yang luar biasa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Malawi', tags: ['geografi', 'negara', 'african-timur', 'East Africa'], region: 'african-timur', capital: 'Lilongwe' }
    },
    {
        text: 'Mesir - Negara di Afrika Utara dengan peradaban kuno dan Suez. Ibu kota: Kairo. Populasi: 110 juta jiwa. Mata uang: Pound (EGP). Bahasa: Arab. Sistem pemerintahan: Republik Semi-Presidensial. Anggota PBB, AU, dan Liga Arab. Rumah bagi piramida Giza, Sphinx, dan Sungai Nil. Pusat peradaban kuno dan pariwisata dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mesir', tags: ['geografi', 'negara', 'african-utara', 'North Africa'], region: 'african-utara', capital: 'Kairo' }
    },
    {
        text: 'Maroko - Negara di Afrika Utara dengan ekonomi dan pariwisata. Ibu kota: Rabat. Populasi: 37 juta jiwa. Mata uang: Dirham (MAD). Bahasa: Arab, Berber. Sistem pemerintahan: Monarki Konstitusional. Anggota PBB, AU, dan Liga Arab. Negara dengan pasar tradisional, Arsitektur Islam, dan pantai Atlantik yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Maroko', tags: ['geografi', 'negara', 'african-utara', 'North Africa'], region: 'african-utara', capital: 'Rabat' }
    },
    {
        text: 'Aljazair - Negara terbesar di Afrika dengan cadangan gas alam. Ibu kota: Aljir. Populasi: 44 juta jiwa. Mata uang: Dinar (DZD). Bahasa: Arab, Berber. Sistem pemerintahan: Republik Semi-Presidensial. Anggota PBB, AU, dan OPEC. Negara dengan gurun Sahara dan cadangan minyak dan gas terbesar di Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Aljazair', tags: ['geografi', 'negara', 'african-utara', 'North Africa'], region: 'african-utara', capital: 'Aljir' }
    },
    {
        text: 'Tunisia - Negara di Afrika Utara dengan sejarah dan pantai Mediterania. Ibu kota: Tunis. Populasi: 12 juta jiwa. Mata uang: Dinar (TND). Bahasa: Arab. Sistem pemerintahan: Republik Parlementer. Anggota PBB, AU, dan Liga Arab. Rumah bagi Kartago kuno dan pantai-pantai indah Mediterania.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tunisia', tags: ['geografi', 'negara', 'african-utara', 'North Africa'], region: 'african-utara', capital: 'Tunis' }
    },
    {
        text: 'Libya - Negara di Afrika Utara dengan cadangan minyak besar. Ibu kota: Tripoli. Populasi: 7 juta jiwa. Mata uang: Dinar (LYD). Bahasa: Arab. Sistem pemerintahan: Republik. Anggota PBB, AU, dan OPEC. Negara dengan cadangan minyak terbesar di Afrika dan gurun Sahara yang luas.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Libya', tags: ['geografi', 'negara', 'african-utara', 'North Africa'], region: 'african-utara', capital: 'Tripoli' }
    },
    {
        text: 'Sudan - Negara di Afrika Utara dengan sungai Nil dan pertanian. Ibu kota: Khartoum. Populasi: 46 juta jiwa. Mata uang: Pound (SDG). Bahasa: Arab, Inggris. Sistem pemerintahan: Republik. Anggota PBB dan AU. Negara dengan sungai Nil dan pertanian subur.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Sudan', tags: ['geografi', 'negara', 'african-utara', 'North Africa'], region: 'african-utara', capital: 'Khartoum' }
    },
    {
        text: 'Mauritania - Negara di Afrika Utara dengan gurun Sahara dan pesisir Atlantik. Ibu kota: Nouakchott. Populasi: 4.7 juta jiwa. Mata uang: Ouguiya (MRU). Bahasa: Arab. Sistem pemerintahan: Republik Presidensial. Negara dengan perbatasan terpanjang di Afrika. Potensi minyak dan gas. Budaya Arab-Berber yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mauritania', tags: ['geografi', 'negara', 'african-utara', 'North Africa'], region: 'african-utara', capital: 'Nouakchott' }
    },
    {
        text: 'Jamaika - Negara kepulauan di Karibia dengan budaya Reggae dan pariwisata. Ibu kota: Kingston. Populasi: 2.9 juta jiwa. Mata uang: Dolar Jamaika (JMD). Bahasa: Inggris, Patois. Sistem pemerintahan: Monarki Konstitusional Parlementer. Negara dengan musik Reggae, Bob Marley, dan pantai-pantai indah. Destinasi wisata terkemuka di Karibia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Jamaika', tags: ['geografi', 'negara', 'american-karibia', 'Caribbean'], region: 'american-karibia', capital: 'Kingston' }
    },
    {
        text: 'Haiti - Negara di Karibia dengan sejarah dan budaya kaya. Ibu kota: Port-au-Prince. Populasi: 11.4 juta jiwa. Mata uang: Gourde (HTG). Bahasa: Prancis, Kreol. Sistem pemerintahan: Republik Presidensial. Negara pertama yang merdeka di Karibia. Sejarah perjuangan kemerdekaan yang kuat. Budaya Afrika dan Prancis yang unik.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Haiti', tags: ['geografi', 'negara', 'american-karibia', 'Caribbean'], region: 'american-karibia', capital: 'Port-au-Prince' }
    },
    {
        text: 'Republik Dominika - Negara di Karibia dengan ekonomi dan pariwisata maju. Ibu kota: Santo Domingo. Populasi: 10.8 juta jiwa. Mata uang: Peso Dominika (DOP). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Negara dengan pantai-pantai indah dan ekonomi terbesar di Karibia. Rumah bagi kota kolonial Santo Domingo dan resor Punta Cana.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Republik Dominika', tags: ['geografi', 'negara', 'american-karibia', 'Caribbean'], region: 'american-karibia', capital: 'Santo Domingo' }
    },
    {
        text: 'Bahama - Negara kepulauan di Karibia dengan pantai pasir putih dan pariwisata. Ibu kota: Nassau. Populasi: 400 ribu jiwa. Mata uang: Dolar Bahama (BSD). Bahasa: Inggris. Sistem pemerintahan: Monarki Konstitusional Parlementer. Destinasi wisata mewah di Karibia. Rumah bagi Atlantis Resort dan pantai-pantai eksotis.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bahama', tags: ['geografi', 'negara', 'american-karibia', 'Caribbean'], region: 'american-karibia', capital: 'Nassau' }
    },
    {
        text: 'Barbados - Negara kepulauan di Karibia dengan ekonomi maju dan pariwisata. Ibu kota: Bridgetown. Populasi: 290 ribu jiwa. Mata uang: Dolar Barbados (BBD). Bahasa: Inggris. Sistem pemerintahan: Republik Parlementer. Negara dengan pantai-pantai indah dan kualitas hidup tinggi. Rumah bagi Rihanna dan pantai-pantai eksotis.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Barbados', tags: ['geografi', 'negara', 'american-karibia', 'Caribbean'], region: 'american-karibia', capital: 'Bridgetown' }
    },
    {
        text: 'Trinidad dan Tobago - Negara kepulauan di Karibia dengan ekonomi minyak dan gas. Ibu kota: Port of Spain. Populasi: 1.4 juta jiwa. Mata uang: Dolar Trinidad (TTD). Bahasa: Inggris. Sistem pemerintahan: Republik Parlementer. Negara dengan minyak dan gas, serta budaya Karibia yang kaya. Rumah bagi karnaval dan masakan Karibia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Trinidad dan Tobago', tags: ['geografi', 'negara', 'american-karibia', 'Caribbean'], region: 'american-karibia', capital: 'Port of Spain' }
    },
    {
        text: 'Puerto Rico - Wilayah Amerika Serikat di Karibia dengan budaya dan pariwisata. Ibu kota: San Juan. Populasi: 3.2 juta jiwa. Mata uang: Dolar AS (USD). Bahasa: Spanyol, Inggris. Sistem pemerintahan: Wilayah AS. Destinasi wisata Karibia dengan pantai-pantai indah. Rumah bagi budaya dan musik Latin yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Puerto Rico', tags: ['geografi', 'negara', 'american-karibia', 'Caribbean'], region: 'american-karibia', capital: 'San Juan' }
    },
    {
        text: 'Brasil - Negara terbesar di Amerika Selatan dengan ekonomi dan Amazon. Ibu kota: Brasilia. Populasi: 215 juta jiwa. Mata uang: Real (BRL). Bahasa: Portugis. Sistem pemerintahan: Republik Federal Presidensial. Anggota G20, BRICS, dan PBB. Negara dengan hutan Amazon terbesar di dunia dan keanekaragaman hayati terkaya. Rumah bagi karnaval Rio, sepak bola, dan pantai Copacabana.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Brasil', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Brasilia' }
    },
    {
        text: 'Argentina - Negara di Amerika Selatan dengan budaya tango dan ekonomi agrikultur. Ibu kota: Buenos Aires. Populasi: 46 juta jiwa. Mata uang: Peso (ARS). Bahasa: Spanyol. Sistem pemerintahan: Republik Federal Presidensial. Anggota G20 dan Mercosur. Negara dengan pampas luas, daging sapi terbaik, dan wine Malbec terkenal. Rumah bagi Patagonia dan Air Terjun Iguazu.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Argentina', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Buenos Aires' }
    },
    {
        text: 'Kolombia - Negara di Amerika Selatan dengan kopi dan keanekaragaman hayati. Ibu kota: Bogota. Populasi: 52 juta jiwa. Mata uang: Peso (COP). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Anggota OECD dan PBB. Negara dengan kopi terbaik dunia, keanekaragaman hayati terkaya, dan pemandangan Andes yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kolombia', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Bogota' }
    },
    {
        text: 'Chili - Negara di Amerika Selatan dengan tambang tembaga dan anggur. Ibu kota: Santiago. Populasi: 19.5 juta jiwa. Mata uang: Peso (CLP). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Anggota OECD dan PBB. Negara dengan tembaga terbesar dunia, wine berkualitas tinggi, dan pemandangan Patagonia yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Chili', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Santiago' }
    },
    {
        text: 'Peru - Negara di Amerika Selatan dengan peradaban Inca dan Machu Picchu. Ibu kota: Lima. Populasi: 34 juta jiwa. Mata uang: Sol (PEN). Bahasa: Spanyol, Quechua. Sistem pemerintahan: Republik Presidensial. Anggota APEC dan PBB. Negara dengan Machu Picchu, salah satu keajaiban dunia. Rumah bagi sejarah Inca, budaya kaya, dan keanekaragaman hayati Amazon.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Peru', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Lima' }
    },
    {
        text: 'Venezuela - Negara di Amerika Selatan dengan cadangan minyak terbesar. Ibu kota: Caracas. Populasi: 28 juta jiwa. Mata uang: Bolivar (VES). Bahasa: Spanyol. Sistem pemerintahan: Republik Federal Presidensial. Anggota OPEC dan PBB. Negara dengan cadangan minyak terbesar di dunia, Angel Falls (air terjun tertinggi di dunia), dan keindahan alam Karibia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Venezuela', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Caracas' }
    },
    {
        text: 'Ekuador - Negara di Amerika Selatan dengan Galapagos dan pisang. Ibu kota: Quito. Populasi: 18 juta jiwa. Mata uang: Dolar AS (USD). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Anggota PBB dan OPEC. Negara dengan Kepulauan Galapagos, Andes yang indah, dan pisang terbaik dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Ekuador', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Quito' }
    },
    {
        text: 'Bolivia - Negara di Amerika Selatan dengan Salar de Uyuni dan litium. Ibu kota: Sucre. Populasi: 12 juta jiwa. Mata uang: Boliviano (BOB). Bahasa: Spanyol, Quechua, Aymara. Sistem pemerintahan: Republik Presidensial. Anggota PBB dan Mercosur. Negara dengan Salar de Uyuni (danau garam terbesar dunia), litium terbesar, dan budaya Andes yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bolivia', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Sucre' }
    },
    {
        text: 'Paraguay - Negara di Amerika Selatan tanpa laut dengan pertanian. Ibu kota: Asuncion. Populasi: 7.5 juta jiwa. Mata uang: Guarani (PYG). Bahasa: Spanyol, Guarani. Sistem pemerintahan: Republik Presidensial. Anggota PBB dan Mercosur. Negara dengan ekonomi pertanian yang berkembang dan budaya Guarani yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Paraguay', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Asuncion' }
    },
    {
        text: 'Uruguay - Negara kecil di Amerika Selatan dengan ekonomi stabil. Ibu kota: Montevideo. Populasi: 3.4 juta jiwa. Mata uang: Peso (UYU). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Anggota PBB dan Mercosur. Negara dengan ekonomi paling stabil di Amerika Selatan, kualitas hidup tinggi, dan teknologi maju.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Uruguay', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Montevideo' }
    },
    {
        text: 'Guyana - Negara di Amerika Selatan dengan ekonomi minyak baru. Ibu kota: Georgetown. Populasi: 0.8 juta jiwa. Mata uang: Dolar Guyana (GYD). Bahasa: Inggris. Sistem pemerintahan: Republik Parlementer. Anggota PBB dan CARICOM. Negara dengan ekonomi minyak yang berkembang pesat dan hutan hujan Amazon yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Guyana', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Georgetown' }
    },
    {
        text: 'Suriname - Negara di Amerika Selatan dengan hutan tropis dan aluminium. Ibu kota: Paramaribo. Populasi: 0.6 juta jiwa. Mata uang: Dolar Suriname (SRD). Bahasa: Belanda. Sistem pemerintahan: Republik Presidensial. Anggota PBB dan CARICOM. Negara dengan hutan hujan Amazon yang luas, keanekaragaman hayati, dan budaya multikultural.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Suriname', tags: ['geografi', 'negara', 'american-selatan', 'South America'], region: 'american-selatan', capital: 'Paramaribo' }
    },
    {
        text: 'Guatemala - Negara di Amerika Tengah dengan budaya Maya dan alam indah. Ibu kota: Guatemala City. Populasi: 18 juta jiwa. Mata uang: Quetzal (GTQ). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Negara dengan peradaban Maya, Tikal, dan Danau Atitlan. Budaya yang kaya dan alam yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Guatemala', tags: ['geografi', 'negara', 'american-tengah', 'Central America'], region: 'american-tengah', capital: 'Guatemala City' }
    },
    {
        text: 'Honduras - Negara di Amerika Tengah dengan alam dan budaya kaya. Ibu kota: Tegucigalpa. Populasi: 10 juta jiwa. Mata uang: Lempira (HNL). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Negara dengan pantai Karibia dan alam yang indah. Rumah bagi peradaban Maya dan Copán.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Honduras', tags: ['geografi', 'negara', 'american-tengah', 'Central America'], region: 'american-tengah', capital: 'Tegucigalpa' }
    },
    {
        text: 'Nikaragua - Negara di Amerika Tengah dengan danau dan gunung berapi. Ibu kota: Managua. Populasi: 6.7 juta jiwa. Mata uang: Córdoba (NIO). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Negara dengan Danau Nikaragua dan gunung berapi aktif. Alam yang indah dan budaya yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Nikaragua', tags: ['geografi', 'negara', 'american-tengah', 'Central America'], region: 'american-tengah', capital: 'Managua' }
    },
    {
        text: 'Kosta Rika - Negara di Amerika Tengah dengan keanekaragaman hayati dan pariwisata. Ibu kota: San José. Populasi: 5.1 juta jiwa. Mata uang: Colón (CRC). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Negara tanpa tentara dan dengan keanekaragaman hayati terbaik. Rumah bagi hutan hujan, gunung berapi, dan pantai-pantai indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kosta Rika', tags: ['geografi', 'negara', 'american-tengah', 'Central America'], region: 'american-tengah', capital: 'San José' }
    },
    {
        text: 'Panama - Negara di Amerika Tengah dengan terusan dan ekonomi maju. Ibu kota: Panama City. Populasi: 4.4 juta jiwa. Mata uang: Balboa (PAB), Dolar AS (USD). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Negara dengan Terusan Panama yang ikonik. Pusat logistik dan keuangan global. Ekonomi terbaik di Amerika Tengah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Panama', tags: ['geografi', 'negara', 'american-tengah', 'Central America'], region: 'american-tengah', capital: 'Panama City' }
    },
    {
        text: 'Belize - Negara di Amerika Tengah dengan bahasa Inggris dan alam indah. Ibu kota: Belmopan. Populasi: 400 ribu jiwa. Mata uang: Dolar Belize (BZD). Bahasa: Inggris. Sistem pemerintahan: Monarki Konstitusional Parlementer. Negara dengan pantai Karibia dan terumbu karang. Bahasa Inggris resmi. Destinasi wisata alam dan budaya Maya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Belize', tags: ['geografi', 'negara', 'american-tengah', 'Central America'], region: 'american-tengah', capital: 'Belmopan' }
    },
    {
        text: 'El Salvador - Negara di Amerika Tengah dengan ekonomi dan budaya kaya. Ibu kota: San Salvador. Populasi: 6.5 juta jiwa. Mata uang: Dolar AS (USD). Bahasa: Spanyol. Sistem pemerintahan: Republik Presidensial. Negara dengan pantai-pantai indah dan budaya kaya. Pemimpin global dalam adopsi Bitcoin. Ekonomi dengan pertumbuhan tinggi dan inovasi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'El Salvador', tags: ['geografi', 'negara', 'american-tengah', 'Central America'], region: 'american-tengah', capital: 'San Salvador' }
    },
    {
        text: 'Kuba - Negara kepulauan di Karibia dengan budaya dan sejarah kaya. Ibu kota: Havana. Populasi: 11.3 juta jiwa. Mata uang: Peso Kuba (CUP). Bahasa: Spanyol. Sistem pemerintahan: Republik Sosialis. Negara dengan musik, tari, dan budaya Karibia yang kaya. Rumah bagi cerutu terbaik dunia dan arsitektur kolonial.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kuba', tags: ['geografi', 'negara', 'american-tengah', 'Caribbean'], region: 'american-tengah', capital: 'Havana' }
    },
    {
        text: 'Amerika Serikat - Negara adidaya di Amerika Utara dengan ekonomi dan militer terbesar dunia. Ibu kota: Washington D.C. Populasi: 334 juta jiwa. Mata uang: Dolar AS (USD). Bahasa: Inggris. Sistem pemerintahan: Republik Federal Konstitusional. Anggota G7, G20, NATO, dan PBB. Pusat teknologi, hiburan, dan keuangan global. Rumah bagi Silicon Valley, Hollywood, dan Wall Street. Negara dengan pengaruh global terbesar di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Amerika Serikat', tags: ['geografi', 'negara', 'american-utara', 'Northern America'], region: 'american-utara', capital: 'Washington D.C.' }
    },
    {
        text: 'Kanada - Negara di Amerika Utara dengan alam dan sumber daya melimpah. Ibu kota: Ottawa. Populasi: 39 juta jiwa. Mata uang: Dolar Kanada (CAD). Bahasa: Inggris, Prancis. Sistem pemerintahan: Monarki Konstitusional Federal Parlementer. Anggota G7, G20, NATO, dan Commonwealth. Pemimpin global dalam energi terbarukan dan AI. Rumah bagi Niagara Falls, Rocky Mountains, dan budaya multikultural.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kanada', tags: ['geografi', 'negara', 'american-utara', 'Northern America'], region: 'american-utara', capital: 'Ottawa' }
    },
    {
        text: 'Meksiko - Negara di Amerika Utara dengan ekonomi dan budaya kaya. Ibu kota: Mexico City. Populasi: 130 juta jiwa. Mata uang: Peso (MXN). Bahasa: Spanyol. Sistem pemerintahan: Republik Federal Presidensial. Anggota G20, USMCA, dan OECD. Pusat manufaktur dan ekspor utama. Rumah bagi peradaban Maya dan Aztec, serta masakan Meksiko yang mendunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Meksiko', tags: ['geografi', 'negara', 'american-utara', 'Central America'], region: 'american-utara', capital: 'Mexico City' }
    },
    {
        text: 'Arab Saudi - Negara terbesar di Asia Barat dan pusat Islam. Ibu kota: Riyadh. Populasi: 36 juta jiwa. Mata uang: Riyal Saudi (SAR). Bahasa: Arab. Sistem pemerintahan: Monarki Absolut. Cadangan minyak terbesar dunia. Rumah kota suci Mekah dan Madinah. Visi 2030 untuk diversifikasi ekonomi. Negara dengan pengaruh global terbesar di Timur Tengah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Arab Saudi', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Riyadh' }
    },
    {
        text: 'Iran - Negara di Asia Barat dengan sejarah dan budaya Persia kuno. Ibu kota: Teheran. Populasi: 88 juta jiwa. Mata uang: Rial Iran (IRR). Bahasa: Persia. Sistem pemerintahan: Republik Islam. Cadangan gas alam terbesar dunia. Pemain utama geopolitik Timur Tengah. Rumah bagi peradaban Persia, arsitektur Islam, dan kekayaan budaya. Kekuatan regional dengan pengaruh di Irak, Suriah, dan Lebanon.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Iran', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Teheran' }
    },
    {
        text: 'Irak - Negara di Asia Barat dengan peradaban Mesopotamia kuno. Ibu kota: Baghdad. Populasi: 44 juta jiwa. Mata uang: Dinar Irak (IQD). Bahasa: Arab, Kurdi. Sistem pemerintahan: Republik Federal Parlementer. Cadangan minyak terbesar ke-5 dunia. Rumah kota suci Najaf dan Karbala. Situs arkeologi Babilonia dan Ur. Negara dengan sejarah peradaban tertua di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Irak', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Baghdad' }
    },
    {
        text: 'Turki - Negara di persimpangan Asia dan Eropa dengan sejarah Ottoman. Ibu kota: Ankara. Populasi: 85 juta jiwa. Mata uang: Lira Turki (TRY). Bahasa: Turki. Sistem pemerintahan: Republik Presidensial. Anggota NATO dan G20. Jembatan antara Timur dan Barat dengan warisan Bizantium dan Ottoman. Rumah bagi Istanbul, Cappadocia, dan Hagia Sophia. Negara dengan pengaruh budaya dan geopolitik besar.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Turki', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Ankara' }
    },
    {
        text: 'Suriah - Negara di Asia Barat dengan sejarah peradaban kuno. Ibu kota: Damaskus. Populasi: 22 juta jiwa. Mata uang: Pound Suriah (SYP). Bahasa: Arab. Sistem pemerintahan: Republik Presidensial. Damaskus salah satu kota tertua di dunia. Warisan budaya Romawi, Bizantium, dan Islam. Negara dengan sejarah panjang dan konflik berkepanjangan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Suriah', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Damaskus' }
    },
    {
        text: 'Yaman - Negara di Asia Barat dengan sejarah kuno dan budaya kaya. Ibu kota: Sanaa. Populasi: 33 juta jiwa. Mata uang: Rial Yaman (YER). Bahasa: Arab. Sistem pemerintahan: Republik Presidensial. Arsitektur kuno unik di Sanaa dan Shibam. Terkenal kopi Mocha dan rempah-rempah. Negara dengan warisan budaya kuno dan konflik berkepanjangan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Yaman', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Sanaa' }
    },
    {
        text: 'Oman - Negara di Asia Barat dengan sejarah maritim dan budaya kaya. Ibu kota: Muskat. Populasi: 4.5 juta jiwa. Mata uang: Rial Oman (OMR). Bahasa: Arab. Sistem pemerintahan: Monarki Absolut. Ekonomi berbasis minyak dan gas. Benteng-benteng kuno dan pelabuhan bersejarah. Salah satu negara paling stabil di Timur Tengah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Oman', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Muskat' }
    },
    {
        text: 'Uni Emirat Arab - Negara federasi di Asia Barat dengan ekonomi maju dan Dubai. Ibu kota: Abu Dhabi. Populasi: 9.5 juta jiwa. Mata uang: Dirham UAE (AED). Bahasa: Arab, Inggris. Sistem pemerintahan: Monarki Konstitusional Federal. Pusat keuangan, perdagangan, dan pariwisata global. Burj Khalifa, gedung tertinggi dunia. Inovasi dan diversifikasi ekonomi terbaik di Timur Tengah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Uni Emirat Arab', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Abu Dhabi' }
    },
    {
        text: 'Qatar - Negara di Asia Barat dengan ekonomi terkaya per kapita. Ibu kota: Doha. Populasi: 2.7 juta jiwa. Mata uang: Riyal Qatar (QAR). Bahasa: Arab. Sistem pemerintahan: Monarki Konstitusional. Cadangan gas alam terbesar ketiga dunia. Tuan rumah Piala Dunia FIFA 2022. Pusat media global Al Jazeera. Negara dengan inovasi dan pengaruh global.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Qatar', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Doha' }
    },
    {
        text: 'Kuwait - Negara di Asia Barat dengan ekonomi berbasis minyak. Ibu kota: Kuwait City. Populasi: 4.3 juta jiwa. Mata uang: Dinar Kuwait (KWD). Bahasa: Arab. Sistem pemerintahan: Monarki Konstitusional. Mata uang tertinggi di dunia. Parlemen aktif dan kebebasan pers relatif tinggi. Negara dengan demokrasi paling maju di Teluk.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kuwait', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Kuwait City' }
    },
    {
        text: 'Bahrain - Negara kepulauan di Asia Barat. Ibu kota: Manama. Populasi: 1.5 juta jiwa. Mata uang: Dinar Bahrain (BHD). Bahasa: Arab. Sistem pemerintahan: Monarki Konstitusional. Pusat keuangan dan perbankan Timur Tengah. Sirkuit Internasional Bahrain tuan rumah F1. Sejarah perdagangan mutiara. Negara dengan ekonomi paling diversifikasi di Teluk.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bahrain', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Manama' }
    },
    {
        text: 'Yordania - Negara di Asia Barat dengan sejarah dan keramahan terkenal. Ibu kota: Amman. Populasi: 11 juta jiwa. Mata uang: Dinar Yordania (JOD). Bahasa: Arab. Sistem pemerintahan: Monarki Konstitusional. Rumah Petra, salah satu keajaiban dunia baru. Negara stabil dengan pariwisata maju. Destinasi wisata terbaik di Timur Tengah dengan situs sejarah kuno dan Laut Mati.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Yordania', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Amman' }
    },
    {
        text: 'Lebanon - Negara di Asia Barat dengan budaya Mediterania dan sejarah kuno. Ibu kota: Beirut. Populasi: 5.5 juta jiwa. Mata uang: Pound Lebanon (LBP). Bahasa: Arab, Prancis. Sistem pemerintahan: Republik Parlementer. Paris-nya Timur Tengah. Keragaman agama dan budaya. Industri perbankan dan pariwisata maju. Rumah bagi reruntuhan Romawi di Baalbek dan pantai Mediterania.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Lebanon', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Beirut' }
    },
    {
        text: 'Israel - Negara di Asia Barat dengan teknologi maju dan sejarah kuno. Ibu kota: Yerusalem. Populasi: 9.5 juta jiwa. Mata uang: Shekel Baru Israel (ILS). Bahasa: Ibrani, Arab. Sistem pemerintahan: Republik Parlementer. Startup Nation — pusat inovasi teknologi global. Kota suci tiga agama: Yudaisme, Kristen, Islam. Negara dengan 10% populasi dunia insinyur dan ilmuwan. Rumah bagi startup dan Unicorn.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Israel', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Yerusalem' }
    },
    {
        text: 'Siprus - Negara kepulauan di Asia Barat dengan budaya Yunani dan Turki. Ibu kota: Nikosia. Populasi: 1.2 juta jiwa. Mata uang: Euro (EUR). Bahasa: Yunani, Turki. Sistem pemerintahan: Republik Presidensial. Anggota UE dan PBB. Satu-satunya negara yang terbagi antara Yunani dan Turki. Destinasi wisata dengan pantai indah dan sejarah kuno.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Siprus', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Nikosia' }
    },
    {
        text: 'Palestina - Negara di Asia Barat dengan sejarah dan budaya kuno. Ibu kota: Ramallah (de facto). Populasi: 5.5 juta jiwa. Mata uang: Shekel Baru Israel (ILS). Bahasa: Arab. Sistem pemerintahan: Republik Semi-Presidensial. Anggota PBB (observer). Rumah kota suci Yerusalem, Bethlehem, dan Hebron. Kaya akan sejarah dan warisan budaya. Destinasi ziarah dan wisata religi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Palestina', tags: ['geografi', 'negara', 'asian-barat', 'Western Asia'], region: 'asian-barat', capital: 'Ramallah' }
    },
    {
        text: 'India - Negara terbesar di Asia Selatan dan terpadat kedua di dunia dengan populasi 1.4 miliar jiwa. Ibu kota: New Delhi. Mata uang: Rupee India (INR). Bahasa: Hindi, Inggris. Sistem pemerintahan: Republik Parlementer Federal. Ekonomi terbesar kelima di dunia. Pemimpin global dalam IT, farmasi, dan startup. Rumah bagi Taj Mahal, Himalaya, dan peradaban kuno. Negara dengan 22 bahasa resmi dan budaya yang sangat beragam.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'India', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'New Delhi' }
    },
    {
        text: 'Pakistan - Negara di Asia Selatan dengan populasi 240 juta jiwa. Ibu kota: Islamabad. Mata uang: Rupee Pakistan (PKR). Bahasa: Urdu, Inggris. Sistem pemerintahan: Republik Parlementer Federal. Ekonomi berkembang dengan sektor pertanian kuat. Rumah peradaban Lembah Indus. Pelabuhan strategis Gwadar. Negara dengan pegunungan Karakoram dan K2 (gunung tertinggi kedua dunia).',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Pakistan', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'Islamabad' }
    },
    {
        text: 'Bangladesh - Negara di Asia Selatan dengan populasi 170 juta jiwa. Ibu kota: Dhaka. Mata uang: Taka (BDT). Bahasa: Bengali. Sistem pemerintahan: Republik Parlementer. Ekonomi berkembang pesat, industri garmen terbesar kedua dunia. Terletak di delta sungai Ganges dan Brahmaputra. Negara dengan kepadatan penduduk tertinggi di dunia. Sektor ekonomi mikro dan fintech yang maju.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bangladesh', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'Dhaka' }
    },
    {
        text: 'Sri Lanka - Negara kepulauan di Asia Selatan dengan keindahan alam dan budaya kaya. Ibu kota: Sri Jayawardenepura Kotte. Populasi: 22 juta jiwa. Mata uang: Rupee Sri Lanka (LKR). Bahasa: Sinhala, Tamil, Inggris. Sistem pemerintahan: Republik Presidensial. Terkenal dengan teh Ceylon, rempah-rempah, dan pariwisata. Rumah bagi anjing laut dan paus biru. Destinasi wisata alam dan budaya terkemuka di Asia Selatan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Sri Lanka', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'Sri Jayawardenepura Kotte' }
    },
    {
        text: 'Nepal - Negara di Asia Selatan dengan Pegunungan Himalaya dan Gunung Everest. Ibu kota: Kathmandu. Populasi: 30 juta jiwa. Mata uang: Rupee Nepal (NPR). Bahasa: Nepal. Sistem pemerintahan: Republik Federal. Destinasi pendakian kelas dunia. Tempat lahir Buddha Gautama. Ekonomi berbasis pariwisata dan pertanian. Rumah bagi 8 dari 10 gunung tertinggi di dunia. Negara dengan keanekaragaman budaya dan alam yang luar biasa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Nepal', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'Kathmandu' }
    },
    {
        text: 'Bhutan - Negara di Asia Selatan dengan konsep Kebahagiaan Nasional Bruto. Ibu kota: Thimphu. Populasi: 800 ribu jiwa. Mata uang: Ngultrum (BTN). Bahasa: Dzongkha. Sistem pemerintahan: Monarki Konstitusional. Karbon negatif, arsitektur dzong, dan budaya Buddhis. Salah satu negara paling bahagia di dunia. Negara dengan kebijakan lingkungan terbaik di dunia. Destinasi ekowisata terkemuka di Asia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bhutan', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'Thimphu' }
    },
    {
        text: 'Maladewa - Negara kepulauan di Asia Selatan dengan resor mewah dan pantai indah. Ibu kota: Male. Populasi: 500 ribu jiwa. Mata uang: Rufiyaa (MVR). Bahasa: Dhivehi. Sistem pemerintahan: Republik Presidensial. Destinasi wisata kelas dunia. Terancam kenaikan permukaan laut. Ekonomi berbasis pariwisata dan perikanan. Pulau-pulau dengan pantai pasir putih dan laut biru jernih. Surga tropis di Samudra Hindia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Maladewa', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'Male' }
    },
    {
        text: 'Afghanistan - Negara di Asia Selatan dengan sejarah Jalur Sutra dan peradaban kuno. Ibu kota: Kabul. Populasi: 38 juta jiwa. Mata uang: Afghani (AFN). Bahasa: Pashto, Dari. Sistem pemerintahan: Republik Islam. Rumah peradaban Baktria dan Gandhara. Kaya akan sumber daya alam seperti litium, tembaga, dan batu bara. Negara dengan sejarah panjang dan budaya yang kaya. Jalan Sutra kuno dan peradaban yang sangat tua.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Afghanistan', tags: ['geografi', 'negara', 'asian-selatan', 'Southern Asia'], region: 'asian-selatan', capital: 'Kabul' }
    },
    {
        text: 'Kazakhstan - Negara terbesar di Asia Tengah dengan ekonomi maju dan sumber daya alam melimpah. Ibu kota: Astana. Populasi: 19 juta jiwa. Mata uang: Tenge (KZT). Bahasa: Kazakh, Rusia. Sistem pemerintahan: Republik Presidensial. Ekonomi terbesar di Asia Tengah. Cadangan minyak, gas, dan mineral besar. Anggota Uni Eurasia. Negara dengan stepa luas dan kota modern. Rumah bagi kosmodrom Baikonur dan keindahan alam Altai.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kazakhstan', tags: ['geografi', 'negara', 'asian-tengah', 'Central Asia'], region: 'asian-tengah', capital: 'Astana' }
    },
    {
        text: 'Uzbekistan - Negara di Asia Tengah dengan sejarah Jalur Sutra dan budaya kaya. Ibu kota: Tashkent. Populasi: 35 juta jiwa. Mata uang: Som Uzbekistan (UZS). Bahasa: Uzbek. Sistem pemerintahan: Republik Presidensial. Populasi terbesar di Asia Tengah. Warisan arsitektur Islam yang kaya. Penghasil kapas terbesar. Negara dengan kota-kota kuno Samarkand, Bukhara, dan Khiva yang memukau.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Uzbekistan', tags: ['geografi', 'negara', 'asian-tengah', 'Central Asia'], region: 'asian-tengah', capital: 'Tashkent' }
    },
    {
        text: 'Turkmenistan - Negara di Asia Tengah dengan cadangan gas alam besar. Ibu kota: Ashgabat. Populasi: 6 juta jiwa. Mata uang: Manat Turkmen (TMT). Bahasa: Turkmen. Sistem pemerintahan: Republik Presidensial. Salah satu cadangan gas alam terbesar dunia. Negara dengan kebijakan netralitas permanen. Arsitektur marmer putih di Ashgabat. Negara dengan sumber daya gas yang melimpah dan budaya nomaden.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Turkmenistan', tags: ['geografi', 'negara', 'asian-tengah', 'Central Asia'], region: 'asian-tengah', capital: 'Ashgabat' }
    },
    {
        text: 'Kirgistan - Negara di Asia Tengah dengan pegunungan dan alam indah. Ibu kota: Bishkek. Populasi: 6.5 juta jiwa. Mata uang: Som Kirgistan (KGS). Bahasa: Kirgiz, Rusia. Sistem pemerintahan: Republik Parlementer. Negara dengan demokrasi paling maju di Asia Tengah. Destinasi trekking dan wisata alam. Anggota Uni Eurasia. Rumah bagi Danau Issyk-Kul dan Pegunungan Tian Shan yang memukau.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kirgistan', tags: ['geografi', 'negara', 'asian-tengah', 'Central Asia'], region: 'asian-tengah', capital: 'Bishkek' }
    },
    {
        text: 'Tajikistan - Negara di Asia Tengah dengan pegunungan Pamir dan budaya Persia. Ibu kota: Dushanbe. Populasi: 9.5 juta jiwa. Mata uang: Somoni (TJS). Bahasa: Tajik, Rusia. Sistem pemerintahan: Republik Presidensial. Negara dengan pegunungan tertinggi di Asia Tengah. Kaya akan air dan energi hidro. Budaya Persia yang kuat. Rumah bagi Pamir Highway dan keindahan alam yang spektakuler.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tajikistan', tags: ['geografi', 'negara', 'asian-tengah', 'Central Asia'], region: 'asian-tengah', capital: 'Dushanbe' }
    },
    {
        text: 'Indonesia - Negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau. Ibu kota: Jakarta (segera pindah ke IKN Nusantara). Populasi: 277 juta jiwa. Mata uang: Rupiah (IDR). Bahasa: Bahasa Indonesia. Sistem pemerintahan: Republik Presidensial. Anggota G20, ASEAN, dan OKI. Negara dengan ekonomi terbesar di Asia Tenggara. Kaya akan sumber daya alam, budaya, dan keanekaragaman hayati. Rumah bagi komodo, orangutan, dan bunga bangkai. Destinasi wisata Bali, Borobudur, dan Raja Ampat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Indonesia', tags: ['geografi', 'negara', 'asian-tenggara', 'Maritime Southeast Asia'], region: 'asian-tenggara', capital: 'Jakarta' }
    },
    {
        text: 'Malaysia - Negara federasi di Asia Tenggara yang terdiri dari 13 negara bagian dan 3 wilayah federal. Ibu kota: Kuala Lumpur. Pusat pemerintahan: Putrajaya. Populasi: 34 juta jiwa. Mata uang: Ringgit (MYR). Bahasa: Bahasa Melayu. Sistem pemerintahan: Monarki Konstitusional Federal. Anggota ASEAN dan OKI. Ekonomi maju dengan sektor elektronik, minyak sawit, dan pariwisata. Rumah bagi Menara Kembar Petronas dan hutan hujan tertua di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Malaysia', tags: ['geografi', 'negara', 'asian-tenggara', 'Maritime Southeast Asia'], region: 'asian-tenggara', capital: 'Kuala Lumpur' }
    },
    {
        text: 'Singapura - Negara kota di Asia Tenggara yang terkenal sebagai pusat keuangan global. Ibu kota: Singapura. Populasi: 5.6 juta jiwa. Mata uang: Dolar Singapura (SGD). Bahasa: Inggris, Mandarin, Melayu, Tamil. Sistem pemerintahan: Republik Parlementer. Anggota ASEAN dan PBB. Negara dengan ekonomi paling kompetitif di dunia. Pusat perdagangan, teknologi, dan inovasi. Rumah bagi Gardens by the Bay, Marina Bay Sands, dan Sentosa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Singapura', tags: ['geografi', 'negara', 'asian-tenggara', 'Maritime Southeast Asia'], region: 'asian-tenggara', capital: 'Singapura' }
    },
    {
        text: 'Thailand - Negara kerajaan di Asia Tenggara yang terkenal dengan budaya dan pariwisata. Ibu kota: Bangkok. Populasi: 70 juta jiwa. Mata uang: Baht (THB). Bahasa: Thai. Sistem pemerintahan: Monarki Konstitusional. Anggota ASEAN dan PBB. Satu-satunya negara di Asia Tenggara yang tidak pernah dijajah. Pusat pariwisata dan ekspor beras terbesar dunia. Rumah bagi kuil-kuil megah, pantai Phuket, dan Chiang Mai yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Thailand', tags: ['geografi', 'negara', 'asian-tenggara', 'Mainland Southeast Asia'], region: 'asian-tenggara', capital: 'Bangkok' }
    },
    {
        text: 'Vietnam - Negara komunis di Asia Tenggara dengan ekonomi berkembang pesat. Ibu kota: Hanoi. Kota terbesar: Ho Chi Minh City. Populasi: 98 juta jiwa. Mata uang: Dong (VND). Bahasa: Vietnam. Sistem pemerintahan: Republik Sosialis. Anggota ASEAN dan PBB. Negara dengan pertumbuhan ekonomi tertinggi di kawasan. Ekspor elektronik, tekstil, dan kopi terbesar. Rumah bagi Teluk Ha Long yang memukau dan sejarah perang Vietnam.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Vietnam', tags: ['geografi', 'negara', 'asian-tenggara', 'Mainland Southeast Asia'], region: 'asian-tenggara', capital: 'Hanoi' }
    },
    {
        text: 'Filipina - Negara kepulauan di Asia Tenggara dengan lebih dari 7.000 pulau. Ibu kota: Manila. Populasi: 110 juta jiwa. Mata uang: Peso (PHP). Bahasa: Filipino, Inggris. Sistem pemerintahan: Republik Presidensial. Anggota ASEAN dan PBB. Negara dengan populasi terbesar kedua di Asia Tenggara. Ekspor jasa BPO, tenaga kerja, dan pertanian. Rumah bagi pantai Boracay, teras beras Banaue, dan Kota Intramuros.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Filipina', tags: ['geografi', 'negara', 'asian-tenggara', 'Maritime Southeast Asia'], region: 'asian-tenggara', capital: 'Manila' }
    },
    {
        text: 'Myanmar - Negara di Asia Tenggara dengan sejarah dan budaya yang kaya. Ibu kota: Naypyidaw. Kota terbesar: Yangon. Populasi: 54 juta jiwa. Mata uang: Kyat (MMK). Bahasa: Myanmar. Sistem pemerintahan: Republik. Anggota ASEAN dan PBB. Negara dengan sumber daya alam melimpah: gas, minyak, batu mulia, dan kayu jati. Rumah bagi pagoda Shwedagon dan Danau Inle yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Myanmar', tags: ['geografi', 'negara', 'asian-tenggara', 'Mainland Southeast Asia'], region: 'asian-tenggara', capital: 'Naypyidaw' }
    },
    {
        text: 'Kamboja - Negara di Asia Tenggara dengan warisan budaya Angkor Wat. Ibu kota: Phnom Penh. Populasi: 17 juta jiwa. Mata uang: Riel (KHR). Bahasa: Khmer. Sistem pemerintahan: Monarki Konstitusional. Anggota ASEAN dan PBB. Destinasi pariwisata kelas dunia dengan candi Angkor. Ekonomi berbasis pariwisata, tekstil, dan pertanian. Rumah bagi Angkor Wat yang megah dan budaya Khmer yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kamboja', tags: ['geografi', 'negara', 'asian-tenggara', 'Mainland Southeast Asia'], region: 'asian-tenggara', capital: 'Phnom Penh' }
    },
    {
        text: 'Laos - Negara tanpa laut di Asia Tenggara dengan pemandangan alam yang indah. Ibu kota: Vientiane. Populasi: 7.5 juta jiwa. Mata uang: Kip (LAK). Bahasa: Lao. Sistem pemerintahan: Republik Sosialis. Anggota ASEAN dan PBB. Negara dengan ekonomi berbasis pertanian dan energi hidro. Sumber listrik ekspor ke Thailand dan Vietnam. Rumah bagi Wat Phou dan Kuang Si Falls yang memukau.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Laos', tags: ['geografi', 'negara', 'asian-tenggara', 'Mainland Southeast Asia'], region: 'asian-tenggara', capital: 'Vientiane' }
    },
    {
        text: 'Brunei Darussalam - Negara kecil di Asia Tenggara dengan kekayaan minyak dan gas. Ibu kota: Bandar Seri Begawan. Populasi: 450 ribu jiwa. Mata uang: Dolar Brunei (BND). Bahasa: Melayu. Sistem pemerintahan: Monarki Absolut. Anggota ASEAN dan OKI. Negara dengan pendapatan per kapita tertinggi di Asia Tenggara. Berdasarkan syariah Islam. Rumah bagi masjid-masjid megah dan Istana Nurul Iman.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Brunei Darussalam', tags: ['geografi', 'negara', 'asian-tenggara', 'Maritime Southeast Asia'], region: 'asian-tenggara', capital: 'Bandar Seri Begawan' }
    },
    {
        text: 'Timor Leste - Negara termuda di Asia Tenggara yang merdeka pada 2002. Ibu kota: Dili. Populasi: 1.4 juta jiwa. Mata uang: Dolar AS (USD). Bahasa: Tetum, Portugis. Sistem pemerintahan: Republik Semi-Presidensial. Anggota PBB, CPLP, dan ASEAN (observer). Negara dengan keindahan alam bawah laut, budaya unik, dan sejarah perjuangan panjang. Potensi pariwisata dan minyak di Selat Timor.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Timor Leste', tags: ['geografi', 'negara', 'asian-tenggara', 'Maritime Southeast Asia'], region: 'asian-tenggara', capital: 'Dili' }
    },
    {
        text: 'China - Negara terbesar di Asia Timur dan terpadat di dunia dengan populasi 1.4 miliar jiwa. Ibu kota: Beijing. Mata uang: Yuan (CNY). Bahasa: Mandarin. Sistem pemerintahan: Republik Sosialis Satu Partai. Negara dengan ekonomi terbesar kedua di dunia dan kekuatan adidaya global. Anggota tetap Dewan Keamanan PBB. Pemimpin dalam AI, 5G, dan manufaktur. Rumah bagi Tembok Besar, Kota Terlarang, dan Terakota. Negara dengan sejarah peradaban 5000 tahun.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'China', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Beijing' }
    },
    {
        text: 'Jepang - Negara kepulauan di Asia Timur dengan teknologi maju dan budaya kaya. Ibu kota: Tokyo. Populasi: 125 juta jiwa. Mata uang: Yen (JPY). Bahasa: Jepang. Sistem pemerintahan: Monarki Konstitusional Parlementer. Ekonomi terbesar ketiga di dunia. Pemimpin dalam robotika, otomotif, dan elektronik. Angka harapan hidup tertinggi di dunia. Rumah bagi Gunung Fuji, kuil-kuil kuno, dan budaya pop global. Negara dengan inovasi dan tradisi yang harmonis.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Jepang', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Tokyo' }
    },
    {
        text: 'Korea Selatan - Negara di Asia Timur dengan ekonomi maju dan budaya pop global. Ibu kota: Seoul. Populasi: 52 juta jiwa. Mata uang: Won (KRW). Bahasa: Korea. Sistem pemerintahan: Republik Presidensial. Pemimpin dalam semikonduktor, smartphone, dan K-pop. Internet tercepat di dunia. Rumah bagi Samsung, Hyundai, dan LG. Negara dengan keajaiban ekonomi Han River. Budaya K-pop dan K-drama yang mendunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Korea Selatan', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Seoul' }
    },
    {
        text: 'Taiwan - Negara kepulauan di Asia Timur dengan ekonomi maju dan industri teknologi tinggi. Ibu kota: Taipei. Populasi: 23.5 juta jiwa. Mata uang: Dolar Taiwan (TWD). Bahasa: Mandarin, Taiwan. Sistem pemerintahan: Republik Demokratis. Pemimpin global dalam produksi semikonduktor (TSMC). Rumah bagi teknologi tinggi, budaya Tionghoa, dan keindahan alam. Pusat inovasi dan manufaktur chip terkemuka di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Taiwan', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Taipei' }
    },
    {
        text: 'Mongolia - Negara di Asia Timur dengan padang rumput luas dan budaya nomaden. Ibu kota: Ulaanbaatar. Populasi: 3.3 juta jiwa. Mata uang: Tugrik (MNT). Bahasa: Mongolia. Sistem pemerintahan: Republik Parlementer. Kepadatan penduduk terendah di dunia. Kaya akan mineral tembaga, batu bara, dan emas. Rumah bagi Genghis Khan dan budaya pengembara. Padang rumput tak berujung dan tradisi menunggang kuda.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mongolia', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Ulaanbaatar' }
    },
    {
        text: 'Hong Kong - Wilayah administratif khusus China di Asia Timur dengan ekonomi kapitalis maju. Ibu kota: Victoria City. Populasi: 7.5 juta jiwa. Mata uang: Dolar Hong Kong (HKD). Bahasa: Kanton, Inggris, Mandarin. Sistem pemerintahan: Wilayah Administratif Khusus. Pusat keuangan global dan pintu gerbang perdagangan China-dunia. Rumah bagi keuangan, logistik, dan budaya hiburan. Kota dengan kebebasan ekonomi tertinggi di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Hong Kong', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Victoria City' }
    },
    {
        text: 'Makau - Wilayah Administratif Khusus China di Asia Timur dengan industri perjudian terbesar dunia. Ibu kota: Makau. Populasi: 700 ribu jiwa. Mata uang: Pataca (MOP). Bahasa: Kanton, Portugis. Sistem pemerintahan: Wilayah Administratif Khusus. Satu-satunya tempat di China dengan perjudian legal. Warisan budaya Portugis yang kuat. Pusat wisata dan hiburan terkemuka di Asia. Rumah bagi kasino terbesar di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Makau', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Makau' }
    },
    {
        text: 'Tibet - Wilayah otonom di China dengan budaya Buddhis Tibet. Ibu kota: Lhasa. Populasi: 3.6 juta jiwa. Mata uang: Yuan (CNY). Bahasa: Tibet, Mandarin. Sistem pemerintahan: Wilayah Otonom. Rumah Istana Potala dan Gunung Everest. Budaya unik dengan pengaruh India dan China. Destinasi spiritual dan ekowisata terkemuka di dunia. Alam pegunungan Himalaya yang memukau.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tibet', tags: ['geografi', 'negara', 'asian-timur', 'Eastern Asia'], region: 'asian-timur', capital: 'Lhasa' }
    },
    {
        text: 'Jerman - Negara terbesar di Eropa Barat dengan ekonomi terkuat di Eropa. Ibu kota: Berlin. Populasi: 84 juta jiwa. Mata uang: Euro (EUR). Bahasa: Jerman. Sistem pemerintahan: Republik Federal Parlementer. Anggota G7, G20, dan UE. Negara dengan industri otomotif, mesin, dan kimia terkemuka dunia. Rumah bagi Mercedes, BMW, Volkswagen, dan Siemens. Negara dengan sejarah panjang dan budaya yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Jerman', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'Berlin' }
    },
    {
        text: 'Prancis - Negara di Eropa Barat dengan budaya dan sejarah kaya. Ibu kota: Paris. Populasi: 68 juta jiwa. Mata uang: Euro (EUR). Bahasa: Prancis. Sistem pemerintahan: Republik Semi-Presidensial. Anggota G7, G20, dan UE. Pusat mode, seni, dan kuliner dunia. Rumah bagi Menara Eiffel, Louvre, dan Riviera Prancis. Negara dengan pengaruh budaya dan diplomatik global.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Prancis', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'Paris' }
    },
    {
        text: 'Inggris - Negara di Eropa Barat dengan pengaruh global besar. Ibu kota: London. Populasi: 67 juta jiwa. Mata uang: Pound Sterling (GBP). Bahasa: Inggris. Sistem pemerintahan: Monarki Konstitusional Parlementer. Anggota G7, G20, dan NATO. Pusat keuangan global dan bahasa internasional. Rumah bagi Big Ben, Buckingham Palace, dan Stonehenge. Negara dengan sejarah dan budaya yang sangat kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Inggris', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'London' }
    },
    {
        text: 'Belanda - Negara di Eropa Barat dengan ekonomi maju dan inovasi tinggi. Ibu kota: Amsterdam. Populasi: 17 juta jiwa. Mata uang: Euro (EUR). Bahasa: Belanda. Sistem pemerintahan: Monarki Konstitusional Parlementer. Anggota UE dan NATO. Negara dengan logistik, perdagangan, dan teknologi terbaik. Rumah bagi kincir angin, bunga tulip, dan kanal-kanal indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Belanda', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'Amsterdam' }
    },
    {
        text: 'Belgia - Negara kecil di Eropa Barat yang menjadi pusat administrasi EU. Ibu kota: Brussel. Populasi: 11 juta jiwa. Mata uang: Euro (EUR). Bahasa: Belanda, Prancis, Jerman. Sistem pemerintahan: Monarki Konstitusional Federal Parlementer. Pusat Uni Eropa dan NATO. Negara dengan cokelat, bir, dan keju terbaik dunia. Rumah bagi arsitektur Art Nouveau dan kota-kota bersejarah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Belgia', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'Brussel' }
    },
    {
        text: 'Swiss - Negara di Eropa Barat dengan netralitas dan perbankan global. Ibu kota: Bern. Populasi: 8.7 juta jiwa. Mata uang: Franc Swiss (CHF). Bahasa: Jerman, Prancis, Italia, Romansh. Sistem pemerintahan: Republik Federal. Negara dengan kualitas hidup tertinggi di dunia. Rumah bagi cokelat, jam, dan Alpen Swiss. Pusat perbankan dan keuangan global. Negara dengan inovasi dan pendidikan terbaik.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Swiss', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'Bern' }
    },
    {
        text: 'Austria - Negara di Eropa Barat dengan alam pegunungan Alpen. Ibu kota: Wina. Populasi: 9 juta jiwa. Mata uang: Euro (EUR). Bahasa: Jerman. Sistem pemerintahan: Republik Federal Parlementer. Anggota UE. Negara dengan musik klasik dan arsitektur indah. Rumah bagi Mozart, Beethoven, dan Strauss. Kota Wina dengan kafe-kafe klasik dan istana-istana megah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Austria', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'Wina' }
    },
    {
        text: 'Irlandia - Negara di Eropa Barat dengan ekonomi teknologi maju. Ibu kota: Dublin. Populasi: 5 juta jiwa. Mata uang: Euro (EUR). Bahasa: Irlandia, Inggris. Sistem pemerintahan: Republik Parlementer. Anggota UE. Pusat teknologi global (Google, Apple, Facebook di Eropa). Negara dengan budaya Celtic dan pemandangan hijau yang indah. Rumah bagi kliff Moher dan pub-pub tradisional.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Irlandia', tags: ['geografi', 'negara', 'eropan-barat', 'Western Europe'], region: 'eropan-barat', capital: 'Dublin' }
    },
    {
        text: 'Italia - Negara di Eropa Selatan dengan sejarah Romawi dan Renaissance. Ibu kota: Roma. Populasi: 59 juta jiwa. Mata uang: Euro (EUR). Bahasa: Italia. Sistem pemerintahan: Republik Parlementer. Anggota G7, G20, dan UE. Negara dengan seni, arsitektur, dan kuliner terbaik dunia. Rumah bagi Colosseum, Menara Pisa, Vatikan, dan kanal Venesia. Pusat mode dan desain global. Negara dengan warisan budaya UNESCO terbanyak di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Italia', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'Roma' }
    },
    {
        text: 'Spanyol - Negara di Eropa Selatan dengan budaya dan pariwisata kaya. Ibu kota: Madrid. Populasi: 47 juta jiwa. Mata uang: Euro (EUR). Bahasa: Spanyol. Sistem pemerintahan: Monarki Konstitusional Parlementer. Anggota UE dan NATO. Negara dengan seni, tari Flamenco, dan arsitektur indah. Rumah bagi Sagrada Familia, Alhambra, dan pantai-pantai Costa del Sol.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Spanyol', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'Madrid' }
    },
    {
        text: 'Portugal - Negara di Eropa Selatan dengan sejarah maritim kuat. Ibu kota: Lisboa. Populasi: 10.3 juta jiwa. Mata uang: Euro (EUR). Bahasa: Portugis. Sistem pemerintahan: Republik Semi-Presidensial. Anggota UE dan NATO. Negara dengan arsitektur Manueline dan pantai-pantai indah. Rumah bagi Fado, Pastel de Nata, dan pemandangan indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Portugal', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'Lisboa' }
    },
    {
        text: 'Yunani - Negara di Eropa Selatan dengan peradaban kuno. Ibu kota: Athena. Populasi: 10.4 juta jiwa. Mata uang: Euro (EUR). Bahasa: Yunani. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan sejarah, filsafat, dan demokrasi. Rumah bagi Parthenon, Santorini, dan pantai-pantai indah. Tempat lahir peradaban Barat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Yunani', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'Athena' }
    },
    {
        text: 'Kroasia - Negara di Eropa Selatan dengan pantai Adriatik indah. Ibu kota: Zagreb. Populasi: 4 juta jiwa. Mata uang: Euro (EUR). Bahasa: Kroasia. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan pantai-pantai indah dan kota-kota bersejarah. Rumah bagi Dubrovnik, Split, dan Istana Diocletian.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kroasia', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'Zagreb' }
    },
    {
        text: 'Slovenia - Negara kecil di Eropa Selatan dengan alam indah. Ibu kota: Ljubljana. Populasi: 2.1 juta jiwa. Mata uang: Euro (EUR). Bahasa: Slovenia. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan Alpen, danau, dan hutan hijau. Rumah bagi Danau Bled, Pegunungan Julian Alps, dan Ljubljana yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Slovenia', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'Ljubljana' }
    },
    {
        text: 'Malta - Negara kepulauan di Eropa Selatan dengan sejarah dan resor. Ibu kota: Valletta. Populasi: 500 ribu jiwa. Mata uang: Euro (EUR). Bahasa: Malta, Inggris. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan sejarah panjang, arsitektur barok, dan pantai-pantai indah. Rumah bagi Kuil-kuil Megalitik dan Valletta yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Malta', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'Valletta' }
    },
    {
        text: 'San Marino - Negara mikro di Eropa Selatan yang dikelilingi Italia. Ibu kota: San Marino. Populasi: 34 ribu jiwa. Mata uang: Euro (EUR). Bahasa: Italia. Sistem pemerintahan: Republik. Negara tertua di Eropa. Terkenal dengan arsitektur abad pertengahan dan perangko. Negara dengan sejarah panjang dan kemerdekaan yang terjaga.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'San Marino', tags: ['geografi', 'negara', 'eropan-selatan', 'Southern Europe'], region: 'eropan-selatan', capital: 'San Marino' }
    },
    {
        text: 'Polandia - Negara terbesar di Eropa Tengah dengan ekonomi berkembang pesat. Ibu kota: Warsawa. Populasi: 37 juta jiwa. Mata uang: Zloty (PLN). Bahasa: Polandia. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan sejarah panjang dan budaya kaya. Rumah bagi kastil-kastil megah, kota-kota bersejarah, dan industri otomotif yang berkembang. Pusat manufaktur dan logistik Eropa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Polandia', tags: ['geografi', 'negara', 'eropan-tengah', 'Central Europe'], region: 'eropan-tengah', capital: 'Warsawa' }
    },
    {
        text: 'Ceko - Negara di Eropa Tengah dengan industri maju dan Praha yang indah. Ibu kota: Praha. Populasi: 10.5 juta jiwa. Mata uang: Koruna (CZK). Bahasa: Ceko. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan arsitektur indah, bir terbaik dunia, dan sejarah panjang. Praha salah satu kota terindah di Eropa. Pusat manufaktur dan pariwisata Eropa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Ceko', tags: ['geografi', 'negara', 'eropan-tengah', 'Central Europe'], region: 'eropan-tengah', capital: 'Praha' }
    },
    {
        text: 'Hungaria - Negara di Eropa Tengah dengan Budapest yang ikonik. Ibu kota: Budapest. Populasi: 9.6 juta jiwa. Mata uang: Forint (HUF). Bahasa: Hungaria. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan arsitektur Art Nouveau, pemandian air panas, dan Danube yang memukau. Budapest salah satu kota terindah di Eropa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Hungaria', tags: ['geografi', 'negara', 'eropan-tengah', 'Central Europe'], region: 'eropan-tengah', capital: 'Budapest' }
    },
    {
        text: 'Slowakia - Negara di Eropa Tengah dengan pegunungan Tatra. Ibu kota: Bratislava. Populasi: 5.4 juta jiwa. Mata uang: Euro (EUR). Bahasa: Slowakia. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan pegunungan Tatra yang indah dan kastil-kastil megah. Pusat manufaktur otomotif Eropa. Bratislava kota yang indah di tepi Danube.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Slowakia', tags: ['geografi', 'negara', 'eropan-tengah', 'Central Europe'], region: 'eropan-tengah', capital: 'Bratislava' }
    },
    {
        text: 'Rusia - Negara terbesar di dunia yang membentang dari Eropa Timur hingga Asia Utara. Ibu kota: Moskow. Populasi: 146 juta jiwa. Mata uang: Rubel (RUB). Bahasa: Rusia. Sistem pemerintahan: Republik Federal Semi-Presidensial. Anggota tetap Dewan Keamanan PBB. Negara dengan cadangan gas alam dan minyak terbesar. Pemimpin global dalam energi, militer, dan teknologi antariksa. Rumah bagi Kremlin, Hermitage, dan Danau Baikal.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Rusia', tags: ['geografi', 'negara', 'eropan-timur', 'Eastern Europe'], region: 'eropan-timur', capital: 'Moskow' }
    },
    {
        text: 'Ukraina - Negara terbesar kedua di Eropa Timur dengan lahan pertanian subur. Ibu kota: Kyiv. Populasi: 41 juta jiwa. Mata uang: Hryvnia (UAH). Bahasa: Ukraina. Sistem pemerintahan: Republik Semi-Presidensial. Lumbung gandum Eropa. Produsen minyak bunga matahari terbesar dunia. Rumah bagi Katedral St. Sophia dan Pechersk Lavra. Negara dengan sejarah panjang dan budaya yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Ukraina', tags: ['geografi', 'negara', 'eropan-timur', 'Eastern Europe'], region: 'eropan-timur', capital: 'Kyiv' }
    },
    {
        text: 'Rumania - Negara di Eropa Timur dengan sejarah dan budaya kaya. Ibu kota: Bukares. Populasi: 19 juta jiwa. Mata uang: Leu (RON). Bahasa: Rumania. Sistem pemerintahan: Republik Semi-Presidensial. Anggota UE dan NATO. Negara dengan arsitektur indah dan alam yang beragam. Rumah bagi Kastil Bran (Dracula) dan Pegunungan Carpathian.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Rumania', tags: ['geografi', 'negara', 'eropan-timur', 'Eastern Europe'], region: 'eropan-timur', capital: 'Bukares' }
    },
    {
        text: 'Belarus - Negara di Eropa Timur dengan ekonomi berbasis industri. Ibu kota: Minsk. Populasi: 9.2 juta jiwa. Mata uang: Rubel Belarus (BYN). Bahasa: Belarus, Rusia. Sistem pemerintahan: Republik Presidensial. Negara dengan hutan-hutan luas dan industri manufaktur. Rumah bagi Kastil Mir dan hutan Bialowieza yang terkenal.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Belarus', tags: ['geografi', 'negara', 'eropan-timur', 'Eastern Europe'], region: 'eropan-timur', capital: 'Minsk' }
    },
    {
        text: 'Bulgaria - Negara di Eropa Timur dengan pantai Laut Hitam. Ibu kota: Sofia. Populasi: 6.5 juta jiwa. Mata uang: Lev (BGN). Bahasa: Bulgaria. Sistem pemerintahan: Republik Parlementer. Anggota UE dan NATO. Negara dengan sejarah panjang dan pantai-pantai indah di Laut Hitam. Rumah bagi biara Rila dan kota-kota bersejarah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bulgaria', tags: ['geografi', 'negara', 'eropan-timur', 'Eastern Europe'], region: 'eropan-timur', capital: 'Sofia' }
    },
    {
        text: 'Moldova - Negara kecil di Eropa Timur dengan pertanian subur. Ibu kota: Chisinau. Populasi: 2.6 juta jiwa. Mata uang: Leu Moldova (MDL). Bahasa: Rumania. Sistem pemerintahan: Republik Parlementer. Negara dengan tanah pertanian subur dan kebun anggur terkenal. Rumah bagi budaya dan sejarah yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Moldova', tags: ['geografi', 'negara', 'eropan-timur', 'Eastern Europe'], region: 'eropan-timur', capital: 'Chisinau' }
    },
    {
        text: 'Norwegia - Negara di Eropa Utara dengan fjord dan kekayaan minyak. Ibu kota: Oslo. Populasi: 5.4 juta jiwa. Mata uang: Krone (NOK). Bahasa: Norwegia. Sistem pemerintahan: Monarki Konstitusional Parlementer. Negara dengan kualitas hidup tertinggi di dunia. Kaya akan minyak, gas, dan pemandangan alam yang indah. Rumah bagi fjord-fjord megah dan Aurora Borealis. Pemimpin global dalam energi terbarukan dan kesetaraan gender.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Norwegia', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Oslo' }
    },
    {
        text: 'Swedia - Negara di Eropa Utara dengan ekonomi maju dan inovasi tinggi. Ibu kota: Stockholm. Populasi: 10.4 juta jiwa. Mata uang: Krona (SEK). Bahasa: Swedia. Sistem pemerintahan: Monarki Konstitusional Parlementer. Negara dengan inovasi, kesetaraan, dan kualitas hidup tertinggi. Rumah bagi Spotify, IKEA, dan Volvo. Pemimpin global dalam teknologi dan hak asasi manusia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Swedia', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Stockholm' }
    },
    {
        text: 'Finlandia - Negara di Eropa Utara dengan pendidikan terbaik dunia. Ibu kota: Helsinki. Populasi: 5.5 juta jiwa. Mata uang: Euro (EUR). Bahasa: Finlandia, Swedia. Sistem pemerintahan: Republik Parlementer. Negara dengan pendidikan dan kualitas hidup terbaik. Rumah bagi sauna, Danau Saimaa, dan Aurora Borealis. Pemimpin global dalam teknologi dan inovasi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Finlandia', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Helsinki' }
    },
    {
        text: 'Denmark - Negara di Eropa Utara dengan sejarah Viking dan desain. Ibu kota: Kopenhagen. Populasi: 5.9 juta jiwa. Mata uang: Krone (DKK). Bahasa: Denmark. Sistem pemerintahan: Monarki Konstitusional Parlementer. Negara dengan desain, kualitas hidup, dan energi terbarukan. Rumah bagi LEGO, hygge, dan istana-istana megah. Pemimpin global dalam energi angin dan keberlanjutan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Denmark', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Kopenhagen' }
    },
    {
        text: 'Islandia - Negara di Eropa Utara dengan alam vulkanik dan aurora. Ibu kota: Reykjavik. Populasi: 0.38 juta jiwa. Mata uang: Krona (ISK). Bahasa: Islandia. Sistem pemerintahan: Republik Parlementer. Negara dengan energi terbarukan 100%. Rumah bagi gunung berapi, gletser, dan Aurora Borealis. Destinasi wisata alam terbaik di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Islandia', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Reykjavik' }
    },
    {
        text: 'Estonia - Negara Baltik di Eropa Utara dengan digitalisasi terbaik. Ibu kota: Tallinn. Populasi: 1.3 juta jiwa. Mata uang: Euro (EUR). Bahasa: Estonia. Sistem pemerintahan: Republik Parlementer. Negara dengan e-government terbaik di dunia. Pemimpin global dalam digitalisasi dan startup. Rumah bagi Skype dan kota abad pertengahan Tallinn.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Estonia', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Tallinn' }
    },
    {
        text: 'Latvia - Negara Baltik di Eropa Utara dengan sejarah dan budaya. Ibu kota: Riga. Populasi: 1.8 juta jiwa. Mata uang: Euro (EUR). Bahasa: Latvia. Sistem pemerintahan: Republik Parlementer. Negara dengan arsitektur Art Nouveau dan budaya Baltik. Riga salah satu kota terindah di Eropa. Pemimpin global dalam inovasi dan startup.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Latvia', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Riga' }
    },
    {
        text: 'Lithuania - Negara Baltik di Eropa Utara dengan ekonomi maju. Ibu kota: Vilnius. Populasi: 2.7 juta jiwa. Mata uang: Euro (EUR). Bahasa: Lithuania. Sistem pemerintahan: Republik Semi-Presidensial. Negara dengan sejarah panjang dan budaya Baltik. Vilnius salah satu kota terindah di Eropa. Pemimpin global dalam fintech dan teknologi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Lithuania', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Vilnius' }
    },
    {
        text: 'Kepulauan Faroe - Wilayah otonom Denmark di Eropa Utara dengan budaya Viking. Ibu kota: Tórshavn. Populasi: 50 ribu jiwa. Mata uang: Krone (DKK). Bahasa: Faroe, Denmark. Sistem pemerintahan: Wilayah Otonom. Pemandangan fjord dan tebing curam. Ekonomi berbasis perikanan. Destinasi wisata alam yang eksotis dan budaya Viking yang kuat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kepulauan Faroe', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Tórshavn' }
    },
    {
        text: 'Svalbard - Wilayah Norwegia di Eropa Utara dengan beruang kutub dan aurora. Ibu kota: Longyearbyen. Populasi: 2.5 ribu jiwa. Mata uang: Krone (NOK). Bahasa: Norwegia. Sistem pemerintahan: Wilayah Khusus. Satu-satunya tempat di dunia yang bebas visa. Gudang benih global. Destinasi wisata Arktik yang eksotis. Rumah bagi beruang kutub dan pemandangan aurora yang spektakuler.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Svalbard', tags: ['geografi', 'negara', 'eropan-utara', 'Northern Europe'], region: 'eropan-utara', capital: 'Longyearbyen' }
    },
    {
        text: 'Australia - Negara terbesar di Oseania dengan ekonomi maju dan alam. Ibu kota: Canberra. Populasi: 26 juta jiwa. Mata uang: Dolar Australia (AUD). Bahasa: Inggris. Sistem pemerintahan: Monarki Konstitusional Federal Parlementer. Anggota G20, OECD, dan Commonwealth. Negara dengan keanekaragaman hayati, Great Barrier Reef, dan budaya Aborigin yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Australia', tags: ['geografi', 'negara', 'osenian', 'Australia and New Zealand'], region: 'osenian', capital: 'Canberra' }
    },
    {
        text: 'Selandia Baru - Negara di Oseania dengan alam dan peternakan. Ibu kota: Wellington. Populasi: 5.2 juta jiwa. Mata uang: Dolar Selandia Baru (NZD). Bahasa: Inggris, Maori. Sistem pemerintahan: Monarki Konstitusional Parlementer. Anggota OECD dan Commonwealth. Negara dengan pemandangan alam yang spektakuler dan budaya Maori yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Selandia Baru', tags: ['geografi', 'negara', 'osenian', 'Australia and New Zealand'], region: 'osenian', capital: 'Wellington' }
    },
    {
        text: 'Fiji - Negara kepulauan di Oseania dengan pariwisata dan perikanan. Ibu kota: Suva. Populasi: 0.9 juta jiwa. Mata uang: Dolar Fiji (FJD). Bahasa: Fiji, Inggris. Sistem pemerintahan: Republik Parlementer. Anggota PBB dan Commonwealth. Destinasi wisata mewah di Pasifik dengan pantai pasir putih dan terumbu karang yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Fiji', tags: ['geografi', 'negara', 'osenian', 'Melanesia'], region: 'osenian', capital: 'Suva' }
    },
    {
        text: 'Papua New Guinea - Negara di Oseania dengan keanekaragaman budaya dan sumber daya alam. Ibu kota: Port Moresby. Populasi: 10 juta jiwa. Mata uang: Kina (PGK). Bahasa: Tok Pisin, Inggris. Sistem pemerintahan: Monarki Konstitusional Parlementer. Negara dengan lebih dari 800 bahasa dan keanekaragaman budaya yang luar biasa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Papua New Guinea', tags: ['geografi', 'negara', 'osenian', 'Melanesia'], region: 'osenian', capital: 'Port Moresby' }
    },
    {
        text: 'Kepulauan Solomon - Negara kepulauan di Oseania dengan perikanan dan pariwisata. Ibu kota: Honiara. Populasi: 0.7 juta jiwa. Mata uang: Dolar Solomon (SBD). Bahasa: Inggris. Sistem pemerintahan: Monarki Konstitusional Parlementer. Negara dengan terumbu karang dan sejarah Perang Dunia II.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kepulauan Solomon', tags: ['geografi', 'negara', 'osenian', 'Melanesia'], region: 'osenian', capital: 'Honiara' }
    },
    {
        text: 'Vanuatu - Negara kepulauan di Oseania dengan aktivitas vulkanik. Ibu kota: Port Vila. Populasi: 0.3 juta jiwa. Mata uang: Vatu (VUV). Bahasa: Bislama, Inggris, Prancis. Sistem pemerintahan: Republik Parlementer. Negara dengan gunung berapi aktif, pantai indah, dan budaya Melanesia yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Vanuatu', tags: ['geografi', 'negara', 'osenian', 'Melanesia'], region: 'osenian', capital: 'Port Vila' }
    },
    {
        text: 'Samoa - Negara kepulauan di Oseania dengan budaya Polinesia. Ibu kota: Apia. Populasi: 0.2 juta jiwa. Mata uang: Tala (WST). Bahasa: Samoa, Inggris. Sistem pemerintahan: Republik Parlementer. Anggota PBB dan Commonwealth. Negara dengan budaya Polinesia yang kaya dan pemandangan alam yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Samoa', tags: ['geografi', 'negara', 'osenian', 'Polynesia'], region: 'osenian', capital: 'Apia' }
    },
    {
        text: 'Tonga - Negara kepulauan di Oseania dengan kerajaan Polinesia. Ibu kota: Nuku\'alofa. Populasi: 0.1 juta jiwa. Mata uang: Pa\'anga (TOP). Bahasa: Tonga, Inggris. Sistem pemerintahan: Monarki Konstitusional. Satu-satunya kerajaan di Pasifik dengan budaya Polinesia yang kaya dan sejarah panjang.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tonga', tags: ['geografi', 'negara', 'osenian', 'Polynesia'], region: 'osenian', capital: 'Nuku\'alofa' }
    },
    {
        text: 'Kepulauan Marshall - Negara kepulauan di Oseania dengan keindahan alam. Ibu kota: Majuro. Populasi: 42 ribu jiwa. Mata uang: Dolar AS (USD). Bahasa: Marshall, Inggris. Sistem pemerintahan: Republik Parlementer. Negara dengan terumbu karang dan laguna yang indah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kepulauan Marshall', tags: ['geografi', 'negara', 'osenian', 'Micronesia'], region: 'osenian', capital: 'Majuro' }
    },
    {
        text: 'Lagos — kota terbesar Nigeria. Populasi 15 juta. Terkenal: pusat ekonomi terbesar Afrika Barat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Lagos', tags: ['geografi', 'kota', 'Nigeria', 'african-barat'], region: 'african-barat', country: 'Nigeria' }
    },
    {
        text: 'Abuja — ibukota Nigeria. Populasi 3,7 juta. Terkenal: kota terencana modern.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Abuja', tags: ['geografi', 'kota', 'Nigeria', 'african-barat'], region: 'african-barat', country: 'Nigeria' }
    },
    {
        text: 'Accra — ibukota Ghana. Populasi 2,5 juta. Terkenal: pantai dan pasar tradisional.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Accra', tags: ['geografi', 'kota', 'Ghana', 'african-barat'], region: 'african-barat', country: 'Ghana' }
    },
    {
        text: 'Abidjan — kota terbesar Pantai Gading. Populasi 5,6 juta. Terkenal: pusat ekonomi dan pelabuhan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Abidjan', tags: ['geografi', 'kota', 'Pantai Gading', 'african-barat'], region: 'african-barat', country: 'Pantai Gading' }
    },
    {
        text: 'Dakar — ibukota Senegal. Populasi 1,2 juta. Terkenal: titik paling barat Afrika, Pulau Goree.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Dakar', tags: ['geografi', 'kota', 'Senegal', 'african-barat'], region: 'african-barat', country: 'Senegal' }
    },
    {
        text: 'Bamako — ibukota Mali. Populasi 2,4 juta. Terkenal: tepi Sungai Niger, musik tradisional.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bamako', tags: ['geografi', 'kota', 'Mali', 'african-barat'], region: 'african-barat', country: 'Mali' }
    },
    {
        text: 'Johannesburg — kota terbesar Afrika Selatan. Populasi 5,8 juta. Terkenal: pusat ekonomi, bekas tambang emas.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Johannesburg', tags: ['geografi', 'kota', 'Afrika Selatan', 'african-selatan'], region: 'african-selatan', country: 'Afrika Selatan' }
    },
    {
        text: 'Cape Town — kota pesisir Afrika Selatan. Populasi 4,7 juta. Terkenal: Table Mountain, pemandangan laut.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Cape Town', tags: ['geografi', 'kota', 'Afrika Selatan', 'african-selatan'], region: 'african-selatan', country: 'Afrika Selatan' }
    },
    {
        text: 'Windhoek — ibukota Namibia. Populasi 480 ribu. Terkenal: dekat gurun Namib.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Windhoek', tags: ['geografi', 'kota', 'Namibia', 'african-selatan'], region: 'african-selatan', country: 'Namibia' }
    },
    {
        text: 'Gaborone — ibukota Botswana. Populasi 270 ribu. Terkenal: gerbang ke Delta Okavango.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Gaborone', tags: ['geografi', 'kota', 'Botswana', 'african-selatan'], region: 'african-selatan', country: 'Botswana' }
    },
    {
        text: 'Harare — ibukota Zimbabwe. Populasi 1,5 juta. Terkenal: kota taman hijau.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Harare', tags: ['geografi', 'kota', 'Zimbabwe', 'african-selatan'], region: 'african-selatan', country: 'Zimbabwe' }
    },
    {
        text: 'Kinshasa — ibukota Kongo. Populasi 15 juta. Terkenal: kota berbahasa Prancis terbesar di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kinshasa', tags: ['geografi', 'kota', 'Kongo', 'african-tengah'], region: 'african-tengah', country: 'Kongo' }
    },
    {
        text: 'Luanda — ibukota Angola. Populasi 8,9 juta. Terkenal: kota pesisir Atlantik yang berkembang pesat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Luanda', tags: ['geografi', 'kota', 'Angola', 'african-tengah'], region: 'african-tengah', country: 'Angola' }
    },
    {
        text: 'Libreville — ibukota Gabon. Populasi 850 ribu. Terkenal: kota pesisir hutan hujan Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Libreville', tags: ['geografi', 'kota', 'Gabon', 'african-tengah'], region: 'african-tengah', country: 'Gabon' }
    },
    {
        text: 'N\'Djamena — ibukota Chad. Populasi 1,6 juta. Terkenal: pertemuan Sungai Chari dan Logone.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'N\'Djamena', tags: ['geografi', 'kota', 'Chad', 'african-tengah'], region: 'african-tengah', country: 'Chad' }
    },
    {
        text: 'Addis Ababa — ibukota Etiopia. Populasi 5,2 juta. Terkenal: markas Uni Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Addis Ababa', tags: ['geografi', 'kota', 'Etiopia', 'african-timur'], region: 'african-timur', country: 'Etiopia' }
    },
    {
        text: 'Nairobi — ibukota Kenya. Populasi 4,4 juta. Terkenal: taman nasional di dalam kota.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Nairobi', tags: ['geografi', 'kota', 'Kenya', 'african-timur'], region: 'african-timur', country: 'Kenya' }
    },
    {
        text: 'Dar es Salaam — kota terbesar Tanzania. Populasi 6,7 juta. Terkenal: pelabuhan utama pantai Swahili.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Dar es Salaam', tags: ['geografi', 'kota', 'Tanzania', 'african-timur'], region: 'african-timur', country: 'Tanzania' }
    },
    {
        text: 'Kampala — ibukota Uganda. Populasi 1,7 juta. Terkenal: dibangun di atas tujuh bukit.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kampala', tags: ['geografi', 'kota', 'Uganda', 'african-timur'], region: 'african-timur', country: 'Uganda' }
    },
    {
        text: 'Mogadishu — ibukota Somalia. Populasi 2,6 juta. Terkenal: kota pesisir bersejarah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mogadishu', tags: ['geografi', 'kota', 'Somalia', 'african-timur'], region: 'african-timur', country: 'Somalia' }
    },
    {
        text: 'Kigali — ibukota Rwanda. Populasi 1,2 juta. Terkenal: kota terbersih di Afrika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kigali', tags: ['geografi', 'kota', 'Rwanda', 'african-timur'], region: 'african-timur', country: 'Rwanda' }
    },
    {
        text: 'Kairo — ibukota Mesir. Populasi 21 juta (metro). Terkenal: Piramida Giza, Sungai Nil.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kairo', tags: ['geografi', 'kota', 'Mesir', 'african-utara'], region: 'african-utara', country: 'Mesir' }
    },
    {
        text: 'Casablanca — kota terbesar Maroko. Populasi 3,7 juta. Terkenal: pusat ekonomi, Masjid Hassan II.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Casablanca', tags: ['geografi', 'kota', 'Maroko', 'african-utara'], region: 'african-utara', country: 'Maroko' }
    },
    {
        text: 'Aljir — ibukota Aljazair. Populasi 2,7 juta. Terkenal: kasbah kota tua UNESCO.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Aljir', tags: ['geografi', 'kota', 'Aljazair', 'african-utara'], region: 'african-utara', country: 'Aljazair' }
    },
    {
        text: 'Tunis — ibukota Tunisia. Populasi 700 ribu. Terkenal: medina kota tua, dekat reruntuhan Kartago.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tunis', tags: ['geografi', 'kota', 'Tunisia', 'african-utara'], region: 'african-utara', country: 'Tunisia' }
    },
    {
        text: 'Tripoli — ibukota Libya. Populasi 1,2 juta. Terkenal: kota tua tepi Mediterania.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tripoli', tags: ['geografi', 'kota', 'Libya', 'african-utara'], region: 'african-utara', country: 'Libya' }
    },
    {
        text: 'Kingston — ibukota Jamaika. Populasi 590 ribu. Terkenal: musik reggae, pelabuhan alami.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kingston', tags: ['geografi', 'kota', 'Jamaika', 'american-karibia'], region: 'american-karibia', country: 'Jamaika' }
    },
    {
        text: 'Port-au-Prince — ibukota Haiti. Populasi 1 juta. Terkenal: sejarah kemerdekaan Karibia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Port-au-Prince', tags: ['geografi', 'kota', 'Haiti', 'american-karibia'], region: 'american-karibia', country: 'Haiti' }
    },
    {
        text: 'Santo Domingo — ibukota Republik Dominika. Populasi 3,3 juta (metro). Terkenal: kota kolonial pertama di Amerika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Santo Domingo', tags: ['geografi', 'kota', 'Republik Dominika', 'american-karibia'], region: 'american-karibia', country: 'Republik Dominika' }
    },
    {
        text: 'Nassau — ibukota Bahama. Populasi 280 ribu. Terkenal: pantai dan resor mewah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Nassau', tags: ['geografi', 'kota', 'Bahama', 'american-karibia'], region: 'american-karibia', country: 'Bahama' }
    },
    {
        text: 'San Juan — ibukota Puerto Rico. Populasi 320 ribu. Terkenal: benteng kolonial Spanyol.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'San Juan', tags: ['geografi', 'kota', 'Puerto Rico', 'american-karibia'], region: 'american-karibia', country: 'Puerto Rico' }
    },
    {
        text: 'Sao Paulo — kota terbesar Brasil. Populasi 12,3 juta. Terkenal: pusat ekonomi terbesar Amerika Selatan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Sao Paulo', tags: ['geografi', 'kota', 'Brasil', 'american-selatan'], region: 'american-selatan', country: 'Brasil' }
    },
    {
        text: 'Rio de Janeiro — kota ikonik Brasil. Populasi 6,7 juta. Terkenal: patung Kristus Penebus, karnaval.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Rio de Janeiro', tags: ['geografi', 'kota', 'Brasil', 'american-selatan'], region: 'american-selatan', country: 'Brasil' }
    },
    {
        text: 'Buenos Aires — ibukota Argentina. Populasi 3 juta. Terkenal: tango, arsitektur Eropa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Buenos Aires', tags: ['geografi', 'kota', 'Argentina', 'american-selatan'], region: 'american-selatan', country: 'Argentina' }
    },
    {
        text: 'Bogota — ibukota Kolombia. Populasi 7,4 juta. Terkenal: dataran tinggi Andes, seni jalanan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bogota', tags: ['geografi', 'kota', 'Kolombia', 'american-selatan'], region: 'american-selatan', country: 'Kolombia' }
    },
    {
        text: 'Lima — ibukota Peru. Populasi 10 juta. Terkenal: kuliner, gerbang ke Machu Picchu.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Lima', tags: ['geografi', 'kota', 'Peru', 'american-selatan'], region: 'american-selatan', country: 'Peru' }
    },
    {
        text: 'Santiago — ibukota Chili. Populasi 6,8 juta. Terkenal: diapit pegunungan Andes.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Santiago', tags: ['geografi', 'kota', 'Chili', 'american-selatan'], region: 'american-selatan', country: 'Chili' }
    },
    {
        text: 'Caracas — ibukota Venezuela. Populasi 2,9 juta. Terkenal: lembah pegunungan Avila.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Caracas', tags: ['geografi', 'kota', 'Venezuela', 'american-selatan'], region: 'american-selatan', country: 'Venezuela' }
    },
    {
        text: 'Guatemala City — ibukota Guatemala. Populasi 3 juta (metro). Terkenal: kota terbesar Amerika Tengah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Guatemala City', tags: ['geografi', 'kota', 'Guatemala', 'american-tengah'], region: 'american-tengah', country: 'Guatemala' }
    },
    {
        text: 'Tegucigalpa — ibukota Honduras. Populasi 1,4 juta. Terkenal: kota pegunungan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tegucigalpa', tags: ['geografi', 'kota', 'Honduras', 'american-tengah'], region: 'american-tengah', country: 'Honduras' }
    },
    {
        text: 'San Jose — ibukota Kosta Rika. Populasi 340 ribu. Terkenal: gerbang wisata alam Kosta Rika.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'San Jose', tags: ['geografi', 'kota', 'Kosta Rika', 'american-tengah'], region: 'american-tengah', country: 'Kosta Rika' }
    },
    {
        text: 'Panama City — ibukota Panama. Populasi 880 ribu. Terkenal: Terusan Panama.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Panama City', tags: ['geografi', 'kota', 'Panama', 'american-tengah'], region: 'american-tengah', country: 'Panama' }
    },
    {
        text: 'San Salvador — ibukota El Salvador. Populasi 1,7 juta (metro). Terkenal: pusat ekonomi negara.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'San Salvador', tags: ['geografi', 'kota', 'El Salvador', 'american-tengah'], region: 'american-tengah', country: 'El Salvador' }
    },
    {
        text: 'Havana — ibukota Kuba. Populasi 2,1 juta. Terkenal: mobil klasik, arsitektur kolonial.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Havana', tags: ['geografi', 'kota', 'Kuba', 'american-tengah'], region: 'american-tengah', country: 'Kuba' }
    },
    {
        text: 'New York — kota terbesar Amerika Serikat. Populasi 8,5 juta. Terkenal: Times Square, Wall Street.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'New York', tags: ['geografi', 'kota', 'Amerika Serikat', 'american-utara'], region: 'american-utara', country: 'Amerika Serikat' }
    },
    {
        text: 'Los Angeles — kota terbesar kedua Amerika Serikat. Populasi 3,9 juta. Terkenal: Hollywood, industri film.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Los Angeles', tags: ['geografi', 'kota', 'Amerika Serikat', 'american-utara'], region: 'american-utara', country: 'Amerika Serikat' }
    },
    {
        text: 'Chicago — kota besar Midwest Amerika Serikat. Populasi 2,7 juta. Terkenal: arsitektur pencakar langit.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Chicago', tags: ['geografi', 'kota', 'Amerika Serikat', 'american-utara'], region: 'american-utara', country: 'Amerika Serikat' }
    },
    {
        text: 'Toronto — kota terbesar Kanada. Populasi 2,9 juta. Terkenal: CN Tower, kota multikultural.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Toronto', tags: ['geografi', 'kota', 'Kanada', 'american-utara'], region: 'american-utara', country: 'Kanada' }
    },
    {
        text: 'Vancouver — kota pesisir Kanada. Populasi 660 ribu. Terkenal: pemandangan pegunungan dan laut.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Vancouver', tags: ['geografi', 'kota', 'Kanada', 'american-utara'], region: 'american-utara', country: 'Kanada' }
    },
    {
        text: 'Mexico City — ibukota Meksiko. Populasi 9,2 juta. Terkenal: reruntuhan Aztek, kota dataran tinggi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mexico City', tags: ['geografi', 'kota', 'Meksiko', 'american-utara'], region: 'american-utara', country: 'Meksiko' }
    },
    {
        text: 'Guadalajara — kota terbesar kedua Meksiko. Populasi 1,5 juta. Terkenal: musik mariachi, tequila.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Guadalajara', tags: ['geografi', 'kota', 'Meksiko', 'american-utara'], region: 'american-utara', country: 'Meksiko' }
    },
    {
        text: 'Indonesia memiliki 38 provinsi dengan total 416 kabupaten/kota. Provinsi terbesar: Jawa Barat (27), Jawa Timur (38), Jawa Tengah (35). Ibukota: Jakarta (segera pindah ke IKN Nusantara). Negara kepulauan terbesar di dunia dengan lebih dari 17.000 pulau. Pusat pemerintahan: Jakarta. Sistem administrasi: provinsi, kabupaten, kota.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Indonesia', tags: ['geografi', 'kota', 'Indonesia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Indonesia' }
    },
    {
        text: 'Malaysia memiliki 13 negara bagian dan 3 wilayah federal. Ibukota: Kuala Lumpur. Pusat pemerintahan: Putrajaya. Negara federasi dengan sistem monarki konstitusional. Terdiri dari Semenanjung Malaysia dan Malaysia Timur (Borneo).',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Malaysia', tags: ['geografi', 'kota', 'Malaysia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Malaysia' }
    },
    {
        text: 'Singapura adalah negara kota dengan 5 distrik utama. Ibukota: Singapura. Negara dengan sistem pemerintahan Republik Parlementer dan ekonomi paling kompetitif di dunia. Terdiri dari pulau utama dan 63 pulau kecil di sekitarnya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Singapura', tags: ['geografi', 'kota', 'Singapura', 'asia-tenggara'], region: 'asia-tenggara', country: 'Singapura' }
    },
    {
        text: 'Thailand memiliki 77 provinsi dan 35 kota utama. Ibukota: Bangkok (Krung Thep). Negara kerajaan dengan sistem monarki konstitusional. Satu-satunya negara di Asia Tenggara yang tidak pernah dijajah. Dibagi menjadi 6 region geografis.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Thailand', tags: ['geografi', 'kota', 'Thailand', 'asia-tenggara'], region: 'asia-tenggara', country: 'Thailand' }
    },
    {
        text: 'Vietnam memiliki 63 provinsi dan 5 kota madya. Ibukota: Hanoi. Kota terbesar: Ho Chi Minh City. Negara dengan sistem pemerintahan Republik Sosialis Satu Partai. Terbagi menjadi 58 provinsi dan 5 kota madya. Ekonomi berkembang pesat dengan pertumbuhan tertinggi di Asia Tenggara.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Vietnam', tags: ['geografi', 'kota', 'Vietnam', 'asia-tenggara'], region: 'asia-tenggara', country: 'Vietnam' }
    },
    {
        text: 'Filipina memiliki 81 provinsi dan 145 kota. Ibukota: Manila. Kota terbesar: Quezon City. Negara kepulauan dengan lebih dari 7.000 pulau. Sistem pemerintahan Republik Presidensial. Terbagi menjadi 17 region, 81 provinsi, dan 145 kota.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Filipina', tags: ['geografi', 'kota', 'Filipina', 'asia-tenggara'], region: 'asia-tenggara', country: 'Filipina' }
    },
    {
        text: 'Myanmar memiliki 14 negara bagian/region dan 6 kota. Ibukota: Naypyidaw. Kota terbesar: Yangon. Negara dengan sistem pemerintahan Republik. Terbagi menjadi 7 negara bagian dan 7 region. Kaya akan sumber daya alam dan warisan budaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Myanmar', tags: ['geografi', 'kota', 'Myanmar', 'asia-tenggara'], region: 'asia-tenggara', country: 'Myanmar' }
    },
    {
        text: 'Kamboja memiliki 25 provinsi dan 4 kota. Ibukota: Phnom Penh. Negara dengan sistem pemerintahan Monarki Konstitusional. Terbagi menjadi 24 provinsi dan 1 munisipalitas. Rumah bagi Angkor Wat dan warisan budaya Khmer yang kaya.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kamboja', tags: ['geografi', 'kota', 'Kamboja', 'asia-tenggara'], region: 'asia-tenggara', country: 'Kamboja' }
    },
    {
        text: 'Laos memiliki 18 provinsi dan 4 kota. Ibukota: Vientiane. Negara tanpa laut dengan sistem pemerintahan Republik Sosialis Satu Partai. Terbagi menjadi 17 provinsi dan 1 prefektur. Negara dengan pemandangan alam yang indah dan Sungai Mekong.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Laos', tags: ['geografi', 'kota', 'Laos', 'asia-tenggara'], region: 'asia-tenggara', country: 'Laos' }
    },
    {
        text: 'Brunei memiliki 4 distrik dan 2 kota. Ibukota: Bandar Seri Begawan. Negara dengan sistem pemerintahan Monarki Absolut. Terbagi menjadi 4 distrik. Negara kecil dengan kekayaan minyak dan gas. Berdasarkan syariah Islam.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Brunei Darussalam', tags: ['geografi', 'kota', 'Brunei Darussalam', 'asia-tenggara'], region: 'asia-tenggara', country: 'Brunei Darussalam' }
    },
    {
        text: 'Bandung — ibukota Jawa Barat, Indonesia. Populasi 2,4 juta. Terkenal: udara sejuk, kota kreatif, kuliner dan factory outlet.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bandung', tags: ['geografi', 'kota', 'Indonesia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Indonesia' }
    },
    {
        text: 'Surabaya — ibukota Jawa Timur, Indonesia. Populasi 2,9 juta. Terkenal: kota pahlawan, pusat industri dan perdagangan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Surabaya', tags: ['geografi', 'kota', 'Indonesia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Indonesia' }
    },
    {
        text: 'Medan — ibukota Sumatera Utara, Indonesia. Populasi 2,4 juta. Terkenal: kota multietnis, kuliner khas Melayu-Batak.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Medan', tags: ['geografi', 'kota', 'Indonesia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Indonesia' }
    },
    {
        text: 'Yogyakarta — kota budaya di Jawa, Indonesia. Populasi 430 ribu. Terkenal: keraton, seni tradisional, kota pelajar.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Yogyakarta', tags: ['geografi', 'kota', 'Indonesia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Indonesia' }
    },
    {
        text: 'Kuala Lumpur — ibukota Malaysia. Populasi 1,8 juta. Terkenal: Menara Petronas, pusat bisnis dan belanja.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kuala Lumpur', tags: ['geografi', 'kota', 'Malaysia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Malaysia' }
    },
    {
        text: 'Johor Bahru — kota di selatan Malaysia dekat Singapura. Populasi 900 ribu. Terkenal: gerbang perbatasan, kawasan industri.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Johor Bahru', tags: ['geografi', 'kota', 'Malaysia', 'asia-tenggara'], region: 'asia-tenggara', country: 'Malaysia' }
    },
    {
        text: 'Chiang Mai — kota terbesar kedua Thailand. Populasi 1,2 juta. Terkenal: kuil kuno, budaya Lanna, pegunungan sejuk.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Chiang Mai', tags: ['geografi', 'kota', 'Thailand', 'asia-tenggara'], region: 'asia-tenggara', country: 'Thailand' }
    },
    {
        text: 'Phuket — pulau wisata terbesar Thailand. Populasi 420 ribu. Terkenal: pantai, wisata bahari, kehidupan malam.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Phuket', tags: ['geografi', 'kota', 'Thailand', 'asia-tenggara'], region: 'asia-tenggara', country: 'Thailand' }
    },
    {
        text: 'Ho Chi Minh City — kota terbesar Vietnam (dahulu Saigon). Populasi 9 juta. Terkenal: pusat bisnis, sejarah Perang Vietnam.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Ho Chi Minh City', tags: ['geografi', 'kota', 'Vietnam', 'asia-tenggara'], region: 'asia-tenggara', country: 'Vietnam' }
    },
    {
        text: 'Hanoi — ibukota Vietnam. Populasi 8 juta. Terkenal: kota tua, danau, arsitektur kolonial Prancis.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Hanoi', tags: ['geografi', 'kota', 'Vietnam', 'asia-tenggara'], region: 'asia-tenggara', country: 'Vietnam' }
    },
    {
        text: 'Cebu — kota terbesar kedua Filipina. Populasi 3 juta (metro). Terkenal: pantai, sejarah kolonial Spanyol.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Cebu', tags: ['geografi', 'kota', 'Filipina', 'asia-tenggara'], region: 'asia-tenggara', country: 'Filipina' }
    },
    {
        text: 'Phnom Penh — ibukota Kamboja. Populasi 2,3 juta. Terkenal: Istana Kerajaan, tepi Sungai Mekong.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Phnom Penh', tags: ['geografi', 'kota', 'Kamboja', 'asia-tenggara'], region: 'asia-tenggara', country: 'Kamboja' }
    },
    {
        text: 'Luang Prabang — kota warisan dunia UNESCO di Laos. Populasi 56 ribu. Terkenal: kuil Buddha, arsitektur kolonial.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Luang Prabang', tags: ['geografi', 'kota', 'Laos', 'asia-tenggara'], region: 'asia-tenggara', country: 'Laos' }
    },
    {
        text: 'Riyadh — ibukota Arab Saudi. Populasi 7,6 juta. Terkenal: pusat pemerintahan, modernisasi cepat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Riyadh', tags: ['geografi', 'kota', 'Arab Saudi', 'asian-barat'], region: 'asian-barat', country: 'Arab Saudi' }
    },
    {
        text: 'Dubai — kota terbesar Uni Emirat Arab. Populasi 3,5 juta. Terkenal: Burj Khalifa, pusat bisnis global.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Dubai', tags: ['geografi', 'kota', 'Uni Emirat Arab', 'asian-barat'], region: 'asian-barat', country: 'Uni Emirat Arab' }
    },
    {
        text: 'Istanbul — kota terbesar Turki. Populasi 15 juta. Terkenal: jembatan Asia-Eropa, Hagia Sophia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Istanbul', tags: ['geografi', 'kota', 'Turki', 'asian-barat'], region: 'asian-barat', country: 'Turki' }
    },
    {
        text: 'Tehran — ibukota Iran. Populasi 9,3 juta. Terkenal: pegunungan Alborz, pusat budaya Persia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tehran', tags: ['geografi', 'kota', 'Iran', 'asian-barat'], region: 'asian-barat', country: 'Iran' }
    },
    {
        text: 'Baghdad — ibukota Irak. Populasi 7,7 juta. Terkenal: sejarah peradaban Mesopotamia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Baghdad', tags: ['geografi', 'kota', 'Irak', 'asian-barat'], region: 'asian-barat', country: 'Irak' }
    },
    {
        text: 'Tel Aviv — kota terbesar Israel. Populasi 460 ribu. Terkenal: pusat teknologi, pantai Mediterania.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tel Aviv', tags: ['geografi', 'kota', 'Israel', 'asian-barat'], region: 'asian-barat', country: 'Israel' }
    },
    {
        text: 'Doha — ibukota Qatar. Populasi 2,4 juta. Terkenal: skyline modern, tuan rumah Piala Dunia 2022.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Doha', tags: ['geografi', 'kota', 'Qatar', 'asian-barat'], region: 'asian-barat', country: 'Qatar' }
    },
    {
        text: 'Mumbai — kota terbesar India. Populasi 20 juta. Terkenal: pusat film Bollywood, finansial.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Mumbai', tags: ['geografi', 'kota', 'India', 'asian-selatan'], region: 'asian-selatan', country: 'India' }
    },
    {
        text: 'Delhi — ibukota India. Populasi 32 juta (metro). Terkenal: Taj Mahal dekat, sejarah kerajaan Mughal.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Delhi', tags: ['geografi', 'kota', 'India', 'asian-selatan'], region: 'asian-selatan', country: 'India' }
    },
    {
        text: 'Bangalore — pusat teknologi India. Populasi 13 juta. Terkenal: Silicon Valley India.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bangalore', tags: ['geografi', 'kota', 'India', 'asian-selatan'], region: 'asian-selatan', country: 'India' }
    },
    {
        text: 'Karachi — kota terbesar Pakistan. Populasi 16 juta. Terkenal: pelabuhan utama, pusat ekonomi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Karachi', tags: ['geografi', 'kota', 'Pakistan', 'asian-selatan'], region: 'asian-selatan', country: 'Pakistan' }
    },
    {
        text: 'Lahore — kota budaya Pakistan. Populasi 13 juta. Terkenal: Benteng Lahore, kuliner.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Lahore', tags: ['geografi', 'kota', 'Pakistan', 'asian-selatan'], region: 'asian-selatan', country: 'Pakistan' }
    },
    {
        text: 'Dhaka — ibukota Bangladesh. Populasi 22 juta. Terkenal: kota terpadat di dunia, industri tekstil.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Dhaka', tags: ['geografi', 'kota', 'Bangladesh', 'asian-selatan'], region: 'asian-selatan', country: 'Bangladesh' }
    },
    {
        text: 'Colombo — ibukota komersial Sri Lanka. Populasi 750 ribu. Terkenal: pelabuhan, kuil Buddha.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Colombo', tags: ['geografi', 'kota', 'Sri Lanka', 'asian-selatan'], region: 'asian-selatan', country: 'Sri Lanka' }
    },
    {
        text: 'Kathmandu — ibukota Nepal. Populasi 1,5 juta. Terkenal: gerbang Himalaya, kuil kuno.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kathmandu', tags: ['geografi', 'kota', 'Nepal', 'asian-selatan'], region: 'asian-selatan', country: 'Nepal' }
    },
    {
        text: 'Almaty — kota terbesar Kazakhstan. Populasi 2 juta. Terkenal: pegunungan Tian Shan, bekas ibukota.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Almaty', tags: ['geografi', 'kota', 'Kazakhstan', 'asian-tengah'], region: 'asian-tengah', country: 'Kazakhstan' }
    },
    {
        text: 'Astana — ibukota Kazakhstan. Populasi 1,2 juta. Terkenal: arsitektur futuristik.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Astana', tags: ['geografi', 'kota', 'Kazakhstan', 'asian-tengah'], region: 'asian-tengah', country: 'Kazakhstan' }
    },
    {
        text: 'Tashkent — ibukota Uzbekistan. Populasi 2,5 juta. Terkenal: kota tertua di Asia Tengah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tashkent', tags: ['geografi', 'kota', 'Uzbekistan', 'asian-tengah'], region: 'asian-tengah', country: 'Uzbekistan' }
    },
    {
        text: 'Bishkek — ibukota Kirgistan. Populasi 1 juta. Terkenal: gerbang pegunungan Tian Shan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bishkek', tags: ['geografi', 'kota', 'Kirgistan', 'asian-tengah'], region: 'asian-tengah', country: 'Kirgistan' }
    },
    {
        text: 'Dushanbe — ibukota Tajikistan. Populasi 900 ribu. Terkenal: bendera tertinggi di dunia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Dushanbe', tags: ['geografi', 'kota', 'Tajikistan', 'asian-tengah'], region: 'asian-tengah', country: 'Tajikistan' }
    },
    {
        text: 'Tokyo — ibukota Jepang. Populasi 14 juta. Terkenal: Shibuya, teknologi, budaya pop.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tokyo', tags: ['geografi', 'kota', 'Jepang', 'asian-timur'], region: 'asian-timur', country: 'Jepang' }
    },
    {
        text: 'Osaka — kota terbesar kedua Jepang. Populasi 2,7 juta. Terkenal: kuliner, kastil Osaka.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Osaka', tags: ['geografi', 'kota', 'Jepang', 'asian-timur'], region: 'asian-timur', country: 'Jepang' }
    },
    {
        text: 'Beijing — ibukota China. Populasi 21 juta. Terkenal: Tembok Besar, Kota Terlarang.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Beijing', tags: ['geografi', 'kota', 'China', 'asian-timur'], region: 'asian-timur', country: 'China' }
    },
    {
        text: 'Shanghai — kota terbesar China. Populasi 26 juta. Terkenal: pusat finansial, The Bund.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Shanghai', tags: ['geografi', 'kota', 'China', 'asian-timur'], region: 'asian-timur', country: 'China' }
    },
    {
        text: 'Seoul — ibukota Korea Selatan. Populasi 9,7 juta. Terkenal: K-pop, teknologi, Gyeongbokgung.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Seoul', tags: ['geografi', 'kota', 'Korea Selatan', 'asian-timur'], region: 'asian-timur', country: 'Korea Selatan' }
    },
    {
        text: 'Busan — kota pelabuhan terbesar Korea Selatan. Populasi 3,4 juta. Terkenal: pantai Haeundae, festival film.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Busan', tags: ['geografi', 'kota', 'Korea Selatan', 'asian-timur'], region: 'asian-timur', country: 'Korea Selatan' }
    },
    {
        text: 'Hong Kong — kota metropolitan otonom China. Populasi 7,5 juta. Terkenal: skyline, pusat finansial Asia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Hong Kong', tags: ['geografi', 'kota', 'Hong Kong', 'asian-timur'], region: 'asian-timur', country: 'Hong Kong' }
    },
    {
        text: 'Taipei — ibukota Taiwan. Populasi 2,6 juta. Terkenal: Taipei 101, pasar malam.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Taipei', tags: ['geografi', 'kota', 'Taiwan', 'asian-timur'], region: 'asian-timur', country: 'Taiwan' }
    },
    {
        text: 'Ulaanbaatar — ibukota Mongolia. Populasi 1,6 juta. Terkenal: kota terdingin di dunia, gerbang stepa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Ulaanbaatar', tags: ['geografi', 'kota', 'Mongolia', 'asian-timur'], region: 'asian-timur', country: 'Mongolia' }
    },
    {
        text: 'Paris — ibukota Prancis. Populasi 2,1 juta. Terkenal: Menara Eiffel, kota mode.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Paris', tags: ['geografi', 'kota', 'Prancis', 'eropan-barat'], region: 'eropan-barat', country: 'Prancis' }
    },
    {
        text: 'Berlin — ibukota Jerman. Populasi 3,7 juta. Terkenal: Tembok Berlin, sejarah modern Eropa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Berlin', tags: ['geografi', 'kota', 'Jerman', 'eropan-barat'], region: 'eropan-barat', country: 'Jerman' }
    },
    {
        text: 'London — ibukota Inggris. Populasi 9 juta. Terkenal: Big Ben, pusat finansial global.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'London', tags: ['geografi', 'kota', 'Inggris', 'eropan-barat'], region: 'eropan-barat', country: 'Inggris' }
    },
    {
        text: 'Amsterdam — ibukota Belanda. Populasi 900 ribu. Terkenal: kanal, sepeda, museum seni.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Amsterdam', tags: ['geografi', 'kota', 'Belanda', 'eropan-barat'], region: 'eropan-barat', country: 'Belanda' }
    },
    {
        text: 'Brussels — ibukota Belgia. Populasi 1,2 juta. Terkenal: markas Uni Eropa, cokelat.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Brussels', tags: ['geografi', 'kota', 'Belgia', 'eropan-barat'], region: 'eropan-barat', country: 'Belgia' }
    },
    {
        text: 'Zurich — kota terbesar Swiss. Populasi 430 ribu. Terkenal: pusat finansial, kualitas hidup tinggi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Zurich', tags: ['geografi', 'kota', 'Swiss', 'eropan-barat'], region: 'eropan-barat', country: 'Swiss' }
    },
    {
        text: 'Vienna — ibukota Austria. Populasi 1,9 juta. Terkenal: musik klasik, istana Schönbrunn.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Vienna', tags: ['geografi', 'kota', 'Austria', 'eropan-barat'], region: 'eropan-barat', country: 'Austria' }
    },
    {
        text: 'Dublin — ibukota Irlandia. Populasi 550 ribu. Terkenal: pub tradisional, sastra.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Dublin', tags: ['geografi', 'kota', 'Irlandia', 'eropan-barat'], region: 'eropan-barat', country: 'Irlandia' }
    },
    {
        text: 'Roma — ibukota Italia. Populasi 2,8 juta. Terkenal: Colosseum, Vatikan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Roma', tags: ['geografi', 'kota', 'Italia', 'eropan-selatan'], region: 'eropan-selatan', country: 'Italia' }
    },
    {
        text: 'Milan — kota mode Italia. Populasi 1,4 juta. Terkenal: fashion, Katedral Duomo.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Milan', tags: ['geografi', 'kota', 'Italia', 'eropan-selatan'], region: 'eropan-selatan', country: 'Italia' }
    },
    {
        text: 'Madrid — ibukota Spanyol. Populasi 3,3 juta. Terkenal: museum Prado, sepak bola.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Madrid', tags: ['geografi', 'kota', 'Spanyol', 'eropan-selatan'], region: 'eropan-selatan', country: 'Spanyol' }
    },
    {
        text: 'Barcelona — kota terbesar kedua Spanyol. Populasi 1,6 juta. Terkenal: arsitektur Gaudi, pantai.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Barcelona', tags: ['geografi', 'kota', 'Spanyol', 'eropan-selatan'], region: 'eropan-selatan', country: 'Spanyol' }
    },
    {
        text: 'Lisbon — ibukota Portugal. Populasi 550 ribu. Terkenal: trem kuno, tepi Sungai Tagus.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Lisbon', tags: ['geografi', 'kota', 'Portugal', 'eropan-selatan'], region: 'eropan-selatan', country: 'Portugal' }
    },
    {
        text: 'Athena — ibukota Yunani. Populasi 660 ribu. Terkenal: Akropolis, peradaban kuno.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Athena', tags: ['geografi', 'kota', 'Yunani', 'eropan-selatan'], region: 'eropan-selatan', country: 'Yunani' }
    },
    {
        text: 'Zagreb — ibukota Kroasia. Populasi 800 ribu. Terkenal: kota tua, pasar Dolac.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Zagreb', tags: ['geografi', 'kota', 'Kroasia', 'eropan-selatan'], region: 'eropan-selatan', country: 'Kroasia' }
    },
    {
        text: 'Warsawa — ibukota Polandia. Populasi 1,8 juta. Terkenal: kota tua yang dibangun kembali pasca perang.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Warsawa', tags: ['geografi', 'kota', 'Polandia', 'eropan-tengah'], region: 'eropan-tengah', country: 'Polandia' }
    },
    {
        text: 'Krakow — kota budaya Polandia. Populasi 780 ribu. Terkenal: alun-alun kota tua, dekat Auschwitz.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Krakow', tags: ['geografi', 'kota', 'Polandia', 'eropan-tengah'], region: 'eropan-tengah', country: 'Polandia' }
    },
    {
        text: 'Praha — ibukota Ceko. Populasi 1,3 juta. Terkenal: jembatan Charles, arsitektur gotik.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Praha', tags: ['geografi', 'kota', 'Ceko', 'eropan-tengah'], region: 'eropan-tengah', country: 'Ceko' }
    },
    {
        text: 'Budapest — ibukota Hungaria. Populasi 1,8 juta. Terkenal: pemandian air panas, Sungai Donau.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Budapest', tags: ['geografi', 'kota', 'Hungaria', 'eropan-tengah'], region: 'eropan-tengah', country: 'Hungaria' }
    },
    {
        text: 'Bratislava — ibukota Slowakia. Populasi 430 ribu. Terkenal: kastil di tepi sungai, kota kecil bersejarah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bratislava', tags: ['geografi', 'kota', 'Slowakia', 'eropan-tengah'], region: 'eropan-tengah', country: 'Slowakia' }
    },
    {
        text: 'Moskow — ibukota Rusia. Populasi 12,6 juta. Terkenal: Kremlin, Lapangan Merah.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Moskow', tags: ['geografi', 'kota', 'Rusia', 'eropan-timur'], region: 'eropan-timur', country: 'Rusia' }
    },
    {
        text: 'Saint Petersburg — kota budaya Rusia. Populasi 5,4 juta. Terkenal: Istana Hermitage, arsitektur kekaisaran.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Saint Petersburg', tags: ['geografi', 'kota', 'Rusia', 'eropan-timur'], region: 'eropan-timur', country: 'Rusia' }
    },
    {
        text: 'Kyiv — ibukota Ukraina. Populasi 3 juta. Terkenal: gereja berkubah emas, kota tertua Slavia Timur.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kyiv', tags: ['geografi', 'kota', 'Ukraina', 'eropan-timur'], region: 'eropan-timur', country: 'Ukraina' }
    },
    {
        text: 'Bucharest — ibukota Rumania. Populasi 1,8 juta. Terkenal: Istana Parlemen, kota Paris Timur.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Bucharest', tags: ['geografi', 'kota', 'Rumania', 'eropan-timur'], region: 'eropan-timur', country: 'Rumania' }
    },
    {
        text: 'Minsk — ibukota Belarus. Populasi 2 juta. Terkenal: arsitektur Soviet, kota bersih dan tertata.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Minsk', tags: ['geografi', 'kota', 'Belarus', 'eropan-timur'], region: 'eropan-timur', country: 'Belarus' }
    },
    {
        text: 'Sofia — ibukota Bulgaria. Populasi 1,3 juta. Terkenal: Katedral Alexander Nevsky, kota tertua Eropa.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Sofia', tags: ['geografi', 'kota', 'Bulgaria', 'eropan-timur'], region: 'eropan-timur', country: 'Bulgaria' }
    },
    {
        text: 'Oslo — ibukota Norwegia. Populasi 700 ribu. Terkenal: fjord, kualitas hidup tinggi.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Oslo', tags: ['geografi', 'kota', 'Norwegia', 'eropan-utara'], region: 'eropan-utara', country: 'Norwegia' }
    },
    {
        text: 'Stockholm — ibukota Swedia. Populasi 980 ribu. Terkenal: kota kepulauan, desain Skandinavia.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Stockholm', tags: ['geografi', 'kota', 'Swedia', 'eropan-utara'], region: 'eropan-utara', country: 'Swedia' }
    },
    {
        text: 'Helsinki — ibukota Finlandia. Populasi 660 ribu. Terkenal: sauna, desain modern.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Helsinki', tags: ['geografi', 'kota', 'Finlandia', 'eropan-utara'], region: 'eropan-utara', country: 'Finlandia' }
    },
    {
        text: 'Kopenhagen — ibukota Denmark. Populasi 640 ribu. Terkenal: kota sepeda, kastil Nyhavn.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Kopenhagen', tags: ['geografi', 'kota', 'Denmark', 'eropan-utara'], region: 'eropan-utara', country: 'Denmark' }
    },
    {
        text: 'Reykjavik — ibukota Islandia. Populasi 130 ribu. Terkenal: gerbang aurora dan geiser.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Reykjavik', tags: ['geografi', 'kota', 'Islandia', 'eropan-utara'], region: 'eropan-utara', country: 'Islandia' }
    },
    {
        text: 'Tallinn — ibukota Estonia. Populasi 440 ribu. Terkenal: kota tua abad pertengahan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Tallinn', tags: ['geografi', 'kota', 'Estonia', 'eropan-utara'], region: 'eropan-utara', country: 'Estonia' }
    },
    {
        text: 'Riga — ibukota Latvia. Populasi 600 ribu. Terkenal: arsitektur art nouveau.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Riga', tags: ['geografi', 'kota', 'Latvia', 'eropan-utara'], region: 'eropan-utara', country: 'Latvia' }
    },
    {
        text: 'Vilnius — ibukota Lithuania. Populasi 540 ribu. Terkenal: kota tua UNESCO.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Vilnius', tags: ['geografi', 'kota', 'Lithuania', 'eropan-utara'], region: 'eropan-utara', country: 'Lithuania' }
    },
    {
        text: 'Sydney — kota terbesar Australia. Populasi 5,3 juta. Terkenal: Opera House, pelabuhan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Sydney', tags: ['geografi', 'kota', 'Australia', 'osenian'], region: 'osenian', country: 'Australia' }
    },
    {
        text: 'Melbourne — kota budaya Australia. Populasi 5 juta. Terkenal: kafe, seni jalanan, olahraga.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Melbourne', tags: ['geografi', 'kota', 'Australia', 'osenian'], region: 'osenian', country: 'Australia' }
    },
    {
        text: 'Auckland — kota terbesar Selandia Baru. Populasi 1,7 juta. Terkenal: kota layar, gunung berapi tidur.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Auckland', tags: ['geografi', 'kota', 'Selandia Baru', 'osenian'], region: 'osenian', country: 'Selandia Baru' }
    },
    {
        text: 'Suva — ibukota Fiji. Populasi 93 ribu. Terkenal: pelabuhan utama Pasifik Selatan.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Suva', tags: ['geografi', 'kota', 'Fiji', 'osenian'], region: 'osenian', country: 'Fiji' }
    },
    {
        text: 'Port Moresby — ibukota Papua Nugini. Populasi 400 ribu. Terkenal: gerbang wisata Papua.',
        metadata: { category: 'dataset', domain: 'dunia', agent: 'Geografi', topic: 'Port Moresby', tags: ['geografi', 'kota', 'Papua Nugini', 'osenian'], region: 'osenian', country: 'Papua Nugini' }
    }
];

export const DATA = data;
