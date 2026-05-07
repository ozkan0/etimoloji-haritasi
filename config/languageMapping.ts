export const mapOriginLanguageToTurkish = (lang: string): string => {
  const codeMap: Record<string, string> = {
    // Turkic / Central Asian
    'Eski Türkçe': 'Eski Türkçe',
    'Karahanlıca': 'Eski Türkçe',
    'Uygurca': 'Eski Türkçe',
    'Yakutça': 'Eski Türkçe',
    'Çuvaşça': 'Eski Türkçe',

    'Orta Türkçe': 'Orta Türkçe',
    'Çağatayca': 'Orta Türkçe',
    'Kıpçakça': 'Orta Türkçe',
    'Harezmce': 'Orta Türkçe',
    'Kazakça': 'Orta Türkçe',
    'Özbekçe': 'Orta Türkçe',
    'Türkmence': 'Orta Türkçe',
    'Kırgızca': 'Orta Türkçe',
    'Tatarca': 'Orta Türkçe',

    'Türkiye Türkçesi': 'Türkçe',
    'Yeni Türkçe': 'Türkçe',
    'Azerice': 'Türkçe',
    'Gagauzca': 'Türkçe',

    // Meso & Levant
    'Akatça': 'Süryanice',
    'Sümerce': 'Süryanice',
    'Aramice': 'Süryanice',

    // Indo-European overrides
    'Yeni Latince': 'Latince',
    'Orta Latince': 'Latince',
    'Geç Latince': 'Latince'
  };
  return codeMap[lang.trim()] || lang.trim();
};
