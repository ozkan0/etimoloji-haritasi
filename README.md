# Etimoloji Haritası

**Türkçe Kelimelerin Köken Yolculuğu**
Bu proje, Türkçedeki kelimelerin etimolojik kökenlerini, tarihsel gelişimlerini ve coğrafi dağılımlarını interaktif bir dünya haritası üzerinde görselleştiren, yapay zeka destekli modern bir web uygulamasıdır.

[Canlı Web Adresi](https://etimoloji-haritasi.vercel.app/)

<img width="1919" height="949" alt="image" src="https://github.com/user-attachments/assets/9076faa7-9ef3-48f1-a7d0-007450ef05de" />

---

## Öne Çıkan Özellikler

### İnteraktif Harita Deneyimi
*   **Dinamik Görselleştirme:** Kelimeler, köken aldıkları ülkelere göre harita üzerinde **rastgele ama sınırların içinde** kalacak şekilde (Point-in-Polygon algoritması ile) yerleştirilir.
*   **Özelleştirilmiş İşaretçiler (Markers):** Kelimeler, modern "hap" (pill) tasarımıyla ve yakınlaştırma (zoom) seviyesine göre dinamik boyutlanan işaretçilerle gösterilir. Seçili kelime, özel bir parlayan efektle vurgulanır.
*   **Akıllı Kümeleme:** Harita üzerinde görsel yoğunluğu yönetmek için ülke başına kelime limiti kullanıcı tarafından ayarlanabilir.

### Yapay Zeka (AI) Entegrasyonu
*   **Derinlemesine Analiz:** Google **Gemini 2.5 Flash** modeli entegrasyonu sayesinde, her kelime için anlık, detaylı ve hikayeleştirilmiş bir etimolojik analiz sunulur. "Detaylı Köken Analizi" butonu, kelimenin sadece kökenini değil, kültürel yolculuğunu ve tarihsel değişimini de anlatır.

### Zaman Yolculuğu (Time Slider)
*   **Tarihsel Filtreleme:** Ekranın altındaki zaman çizelgesi (Timeline) ile kelimeleri dilimize giriş tarihlerine (1000 - 2026) göre filtreleyebilirsiniz. Slider hareket ettikçe harita anlık olarak güncellenir.
*   **Dönemlere Göre Ayrım:** Osmanlı Öncesi, Osmanlı ve Cumhuriyet dönemlerine göre hızlı filtreleme seçenekleri.

### Canlı Veri & Detaylar
*   **TDK Entegrasyonu:** Kelimelerin güncel anlamları ve örnek cümleleri, **Türk Dil Kurumu** API'sinden canlı olarak çekilir.
*   **Zengin İçerik:** Her kelime için köken dili bayrağı, giriş tarihi, kaynak bilgisi ve "Etimoloji Türkçe" ile "Google" gibi dış kaynaklara hızlı erişim linkleri bulunur.

### Veri Analizi Paneli
*   **İstatistikler:** Veritabanındaki kelimelerin dil ve dönem dağılımlarını gösteren, görsel olarak zenginleştirilmiş (Chart) bir analiz paneli.

### Modern & Duyarlı Arayüz (UI/UX)
*   **Glassmorphism Tasarım:** Şeffaf, bulanık arka planlar ve modern gradyanlar.
*   **Koyu/Açık Mod:** Sistem temasına duyarlı veya manuel değiştirilebilir tema desteği.
*   **Mobil Uyumlu:** Telefon ve tabletlerde kusursuz çalışan responsive tasarım.
*   **NewsTicker:** Üst bantta akan, dil üzerine ilginç bilgiler ve sözler.
---

## Kullanılan Teknolojiler

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Dil:** [TypeScript](https://www.typescriptlang.org/)
*   **Harita:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
*   **Harita Sağlayıcı:** [Jawg Maps](https://www.jawg.io/)
*   **Veritabanı:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Yapay Zeka:** [Google Gemini API](https://ai.google.dev/)
*   **Veri Görselleştirme:** Point-in-Polygon (GeoJSON işlemleri)
*   **Stil:** CSS3, Styled-JSX & CSS Variables
---

## Installation & Local Development

Follow these steps to run the project on your local machine.

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Step 1: Clone the Repository
```bash
git clone https://github.com/ozkan0/etimoloji-haritasi.git
cd etimoloji-haritasi
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory and populate it with your own API keys:

```env
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI (For Etymological Analysis)
GEMINI_API_KEY=your-gemini-api-key

# Map Tile Provider (Jawg Maps)
NEXT_PUBLIC_JAWG_TOKEN=your-jawg-access-token
```

### Step 4: Start the Development Server
```bash
npm run dev
# or
yarn dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.
