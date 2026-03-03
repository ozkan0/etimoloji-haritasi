import { LanguageState } from '../context/LanguageContext';

// Simple dictionary for mapping Turkish base UI strings to English when necessary.
const dictionary: Record<string, string> = {
    // Common UI
    'Tüm Diller': 'All Languages',
    'Tüm Dönemler': 'All Periods',
    'Hakkında': 'About',
    'İstatistikler': 'Statistics',
    'Kelime Ara...': 'Search words...',
    'Öneri': 'Suggestion',
    'Hata Bildir': 'Report Issue',
    'Bildirildi': 'Reported',

    // Right details panel
    'Detay Paneli': 'Details Panel',
    'Köken Dil': 'Ultimate Origin',
    'Alındığı Dil': 'Immediate Source',
    'Girdiği Dönem': 'Period',
    'İlk Tespit Tarihi': 'First Detected Date',
    'TDK ANLAMI': 'TDK MEANING',
    'Yükleniyor...': 'Loading...',
    'ETİMOLOJİK ANALİZ': 'ETYMOLOGICAL ANALYSIS',
    'Detaylı Köken Analizi': 'Detailed Origin Analysis',
    'Analiz ediliyor...': 'Analyzing...',
    'ÖRNEK CÜMLE': 'EXAMPLE SENTENCE',
    'Örnek cümle bulunamadı.': 'Example sentence not found.',
    'KAYNAK': 'SOURCE',
    'Bilinmeyen Kaynak': 'Unknown Source',
    'Kaynağa Git ↗': 'Go to Source ↗',
    'DİJİTAL REFERANSLAR': 'DIGITAL REFERENCES',

    // About Panel
    'Site Hakkında': 'About the Website',
    "Türkçe kelimelerin kökenlerini coğrafi ve tarihsel bir bağlamda keşfetmenizi sağlayan, açık kaynaklı modern bir veri görselleştirme projesidir. TDK ve diğer etimoloji kaynaklarından derlenen verilerle Türkçe'nin zenginliğini ve kelimelerinin yolculuğunu farklı bir yaklaşımla interaktif harita üzerinden öğrenilmesini amaçlar.": "An open-source, modern data visualization project that allows you to discover the origins of Turkish words in a geographical and historical context. Compiled with data from TDK and other etymology sources, it aims to teach the richness of Turkish and the journey of its words through a different approach via an interactive map.",
    'Geliştirici': 'Developer',
    'Danışman': 'Consultant',
    "GitHub'da İncele": 'View on GitHub',

    // Forms / Modals
    'Hata / Yanlış Bilgi Bildir': 'Report Issue / Incorrect Info',
    'Düzenleme / İçerik Öner': 'Suggest Edit / Content',
    'Yanlış Köken Bilgisi': 'Incorrect Origin Info',
    'Yanlış Dil Etiketi': 'Incorrect Language Tag',
    'Yazım Hatası': 'Typo',
    'Hatalı Anlam/TDK': 'Incorrect Meaning/TDK',
    'Site Hatası / Bug': 'Site Error / Bug',
    'Diğer': 'Other',
    'Daha İyi Bir Açıklama': 'Better Explanation',
    'Kaynak Ekleme': 'Add Source',
    'Örnek Cümle Önerisi': 'Example Sentence Suggestion',
    'Etimolojik Detay': 'Etymological Detail',
    'Lütfen bir kategori seçiniz.': 'Please select a category.',
    'Bir hata oluştu. Lütfen tekrar deneyin.': 'An error occurred. Please try again.',
    'kelimesi için bildirimde bulunuyorsunuz.': 'is the related word for this report.',
    'Konu Başlığı': 'Topic Title',
    'Seçiniz...': 'Select...',
    'Açıklama / Detay': 'Description / Detail',
    'Hatayı kısaca açıklayınız...': 'Briefly explain the issue...',
    'Önerinizi detaylandırınız...': 'Detail your suggestion...',
    'İptal': 'Cancel',
    'Gönderiliyor...': 'Sending...',
    'Gönder': 'Submit',

    // Statistics Panel
    'Veriler Analiz Ediliyor...': 'Analyzing Data...',
    'Köken Dili Dağılımı': 'Origin Language Distribution',
    'Dönem Dağılımı': 'Period Distribution',
    'Bilinmiyor': 'Unknown',
    'Zaman Çizelgesi Yapım Aşamasında (Yüzyıl sistemine geçiliyor)': 'Timeline Under Construction (Transitioning to Century System)',

    // Sidebar
    'Etimoloji Haritası': 'Etymology Map',
    'Haritayı Filtrele': 'Filter Map',
    'Sıfırla': 'Reset',
    'Filtreleri sıfırla': 'Reset filters',
    'Sonuç bulunamadı.': 'No results found.',
    'GÜNÜN KELİMESİ': 'WORD OF THE DAY',
    'Haritada Dil Başına Kelime': 'Words Per Language (Map)',

    // Languages & Periods
    'Cumhuriyet': 'Republic',
    'Osmanlı Öncesi': 'Pre-Ottoman',
    'Osmanlı': 'Ottoman',
    'Eski Türkçe': 'Old Turkic',
    'Orta Türkçe': 'Middle Turkic',
    'Eski Anadolu Türkçesi': 'Old Anatolian Turkic',
    'Osmanlıca': 'Ottoman',

    // Languages
    'Türkçe': 'Turkish',
    'Fransızca': 'French',
    'Farsça': 'Persian',
    'İtalyanca': 'Italian',
    'İngilizce': 'English',
    'Arapça': 'Arabic',
    'Almanca': 'German',
    'Yunanca': 'Greek',
    'Hırvatça': 'Croatian',
    'Çekçe': 'Czech',
    'Japonca': 'Japanese',
    'İspanyolca': 'Spanish',
    'Latince': 'Latin',
    'Rusça': 'Russian',
    'Ermenice': 'Armenian',
    'Rumca': 'Greek (Rum)',
    'Kürtçe': 'Kurdish',
    'İbranice': 'Hebrew',
    'Soğdca': 'Sogdian',
    'Süryanice': 'Syriac',
    'Bulgarca': 'Bulgarian',
    'Moğolca': 'Mongolian',
    'Sırpça': 'Serbian',
    'Slavca': 'Slavic',
    'Pehlevice': 'Pahlavi',
    'Eski Farsça': 'Old Persian',
    'Sanskritçe': 'Sanskrit',
    'Aramice': 'Aramaic',
};

/**
 * Translates a given Turkish string to English based on the active language context.
 * If the language is 'tr', it returns the original string.
 * @param text The base string in Turkish.
 * @param lang The current active language state.
 * @returns The translated string, or the original string if no translation exists.
 */
export const t = (text: string, lang: LanguageState): string => {
    if (lang === 'tr') return text;
    return dictionary[text] || text;
};
