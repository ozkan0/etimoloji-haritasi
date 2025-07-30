
# Etimoloji Haritası

**Türkçe Kelimelerin Köken Haritası**

Bu proje, Türkçedeki kelimelerin etimolojik kökenlerini interaktif bir dünya haritası üzerinde görselleştiren bir web uygulamasıdır.

<img width="1920" height="958" alt="etimoloji-haritasi-latest-beta" src="https://github.com/user-attachments/assets/82dbce5d-e29e-4572-aad8-806b728720ac" />

canlı demo:    https://etimoloji-haritasi.vercel.app/
## Proje Hakkında

Etimoloji Haritası, Türkçenin tarih boyunca diğer dillerle olan etkileşimini analitik verilerle ve görsel bir arayüzle sunmayı hedefler. Kullanıcılar, kelimelerin köken dillerini ve Türkçeye hangi tarihsel dönemde girdiklerini harita üzerinde keşfedebilirler.

Bu platformun interaktif anlatımı ve toplu veri sunması sayesinde lise ve ortaokul öğrencilerinden dil meraklılarına kadar geniş bir kitle için değerli ve eğitici bir kaynak haline gelebilecek.

### Temel Özellikler

*   **İnteraktif Dünya Haritası:** Kelime kökenlerini coğrafi olarak gösteren, kaydırılabilir ve yakınlaştırılabilir Leaflet haritası.
*   **Dinamik Kelime İşaretçileri:** Harita üzerinde varsayılan ikonlar yerine kelimelerin kendisi gösterilir.
*   **Filtrelenebilir Kelime Listesi:** Sol panelde bulunan tüm kelimeleri anlık olarak arama, köken diline veya döneme göre filtreleme.
*   **Bilgilendirici Pencereler:** Haritadaki bir kelimeye tıklandığında, o kelimenin kökeni ve örnek cümle kullanımı gibi temel bilgileri gösteren bir pencere açılır.
*   **Detay Paneli:** Kullanıcılar, daha fazla bilgi için kelimenin kaynak, referanslar ve dönem gibi tüm detaylarını içeren sağ paneli açabilirler.

### Kullanılan Teknolojiler

*   **Framework:** Next.js
*   **Dil:** TypeScript
*   **UI Kütüphanesi:** React
*   **Harita:** Leaflet & React Leaflet
*   **Veri Yönetimi:** Statik JSON

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

*   **Karanlık/Aydınlık Mod:** Kullanıcıların tercihine göre arayüz temasını değiştirebilmesi için bir switch.
*   **Mobil Uyumluluk:** Uygulamanın telefon ve tablet gibi küçük ekranlarda da sorunsuz ve estetik bir şekilde çalışması için arayüzün iyileştirilmesi.
*   **URL ile Durum Paylaşımı:** Belirli bir kelime seçiliyken veya bir filtre uygulanmışken, o anki görünümün URL üzerinden paylaşılabilmesi.
*   **Kullanıcı Katkısı:** Kullanıcıların yeni kelime önermesi veya mevcut verilerde düzeltme talep etmesi için bir form sistemi.
*   **Veritabanı Entegrasyonu:** Proje büyüdükçe, kelime verilerini yönetmek için JSON dosyaları yerine Supabase veya Firebase gibi bir veritabanı çözümüne geçilmesi.
*   **Gelişmiş Görselleştirmeler:** Kelime detayları panelinde, kelimenin kullanım sıklığı gibi verileri gösteren basit grafikler eklenmesi.

## Katkıda Bulunma

Katkıda bulunmak isterseniz, lütfen bir "issue" açarak veya bir "pull request" göndererek iletişime geçin. Tüm katkılara açığım.

## Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.
