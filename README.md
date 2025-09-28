
# Etimoloji Haritası

**Türkçe Kelimelerin Köken Haritası**

Bu proje, Türkçedeki kelimelerin etimolojik kökenlerini interaktif bir dünya haritası üzerinde görselleştiren bir web uygulamasıdır.

<img width="1920" height="956" alt="image" src="https://github.com/user-attachments/assets/1744c98f-911b-49c2-bbe8-002aeec25c0f" />

Canlı demo (vercel):    https://etimoloji-haritasi.vercel.app/
## Proje Hakkında

Etimoloji Haritası, Türkçe kelimelerin kelime kökenlerini karşılaştırılabilir kaynaklarla, analitik verilerle pratik ve interaktif bir arayüzde sunmayı hedefler. Harita üzerinde kelimelerin dağılımı; merakı, öğrenme ve araştırma verimliliğini artırır.

Bu platformun interaktif anlatımı ve toplu veri sunması sayesinde lise ve ortaokul öğrencilerinden dil meraklılarına kadar geniş bir kitle için değerli ve eğitici bir kaynak haline gelebilecek.

### Temel Özellikler

*   **İnteraktif Dünya Haritası:** Kelimeler, köken dillerine göre coğrafi konumda, kaydırılabilir ve yakınlaştırılabilir açık kaynaklı harita üzerinde belirir.
*   **Özel Kelime İşaretçileri:** Harita üzerinde varsayılan ikonlar yerine özelleştirilmiş kelime işaretçileri kullanılmıştır.
*   **Filtrelenebilir Kelime Listesi:** Sol panelde bulunan tüm kelimeleri anlık olarak arama, köken diline veya döneme göre filtreleme.
*   **Bilgilendirici Pencereler:** Haritadaki bir kelimeye tıklandığında, o kelimenin kökeni ve örnek cümle kullanımı gibi temel bilgileri gösteren bir pencere açılır.
*   **Detay Paneli:** Kullanıcılar, kelime hakkında daha fazla bilgi için ve farklı kaynaklar, ilgili referanslar gibi tüm detaylara sağ panelden ulaşabilirler.
*   **Canlı Veri:** TDK gibi güvenilir sözlüklerden ek bilgiler için detay paneline anlık ve otomatik veri çekebilme.

### Kullanılan Teknolojiler

*   **Framework:** Next.js
*   **Dil:** TypeScript, Html, Css
*   **UI Kütüphanesi:** React
*   **Harita:** Leaflet & Jawg Maps
*   **Veri Yönetimi:** Supabase DB & Statik JSON

## Projeyi Yerel Makinede Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

*   Node.js (v18 veya üstü)
*   npm

### Kurulum

1.  **Repository'yi klonlayın:**
    ```bash
    git clone https://github.com/kullanici-adiniz/etimoloji-haritasi.git
    ```

2.  **Proje dizinine gidin:**
    ```bash
    cd etimoloji-haritasi
    ```

3.  **Gerekli paketleri yükleyin:**
    ```bash
    npm install
    ```

4.  **Geliştirme sunucusunu başlatın:**
    ```bash
    npm run dev
    ```

5.  Tarayıcınızda `http://localhost:3000` adresini açın.

## Planlanan Yeni Özellikler (Roadmap)

Bu proje aktif olarak geliştirilmektedir. Gelecekte eklenmesi planlanan bazı özellikler:

*   **Mobil Uyumluluk:** Uygulamanın telefon ve tablet gibi küçük ekranlarda da sorunsuz ve estetik bir şekilde çalışması için arayüzün iyileştirilmesi.
*   **Hızlı Filtreleme:** Detay paneli içeriğindeki köken dil ve dönem değerlerine göre tek buton tıklamasıyla spesifik dile/döneme göre anında filtreleyebilme.
*   **Kullanıcı Katkısı:** Kullanıcıların yeni kelime önermesi veya mevcut verilerde düzeltme talep etmesi için bir form sistemi.
*   **Gelişmiş Görselleştirmeler:** Kelime detayları panelinde, kelimenin kullanım sıklığı gibi verileri gösteren basit grafikler eklenmesi.
*   **URL ile Durum Paylaşımı:** Belirli bir kelime seçiliyken veya bir filtre uygulanmışken, o anki görünümün URL üzerinden paylaşılabilmesi.
*   ✅ **Karanlık/Aydınlık Mod:** Kullanıcıların tercihine göre arayüz temasını değiştirebilmesi için bir switch.
*   ✅ **Veritabanı Entegrasyonu:** Proje büyüdükçe, kelime verilerini yönetmek için JSON dosyaları yerine Supabase veya Firebase gibi bir veritabanı çözümüne geçilmesi.

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen bir "issue" açarak veya bir "pull request" göndererek iletişime geçin. Tüm katkılara açığım.

## Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.
