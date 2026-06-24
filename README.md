# Etimoloji Haritası

[![Live](https://img.shields.io/badge/live-etimoloji--haritasi.vercel.app-2f86a8)](https://etimoloji-haritasi.vercel.app/)

Türkçedeki kelimelerin kökenlerini, dilimize giriş tarihlerini ve coğrafi dağılımını interaktif bir dünya haritası üzerinde gösteren bir web uygulamasıdır. Ana amacı; etimolojiyi yoğun yazı blokları üzerinden öğrenmek yerine, merak uyandıran bir görsel dille harita üzerinde keşfetmeyi kolaylaştırmaktır.

**Temalar ve Genel Görünüm**

<img width="1920" height="946" alt="Screenshot_20260623_151036" src="https://github.com/user-attachments/assets/25e4f868-97f3-4d50-b51a-11b8d23b2c0d" />

<img width="1920" height="949" alt="Screenshot_20260623_151409" src="https://github.com/user-attachments/assets/a9076b78-1f80-44e4-9a25-0112d66a7530" />

_Koyu/açık tema ve mobil uyumlu, responsive arayüz._

## Özellikler

- İnteraktif harita: kelimeler köken aldıkları ülkelere göre konumlanır, yakınlaştırmaya göre ölçeklenir
- Yenile butonu: haritayı her tıkta tamamen yeni ve tekrarsız bir kelime grubuyla doldurur; tüm kelimeler gösterildiğinde liste yeniden karıştırılıp baştan başlar
- Harita yoğunluğu: ayarlar menüsünden dil başına haritada gösterilen kelime sayısı (5–25) ayarlanır
- Hızlı filtreler: köken/geçiş diline ve döneme (Osmanlı öncesi, Osmanlı, Cumhuriyet) göre tek tıkla filtreleme
- Zaman çizelgesi: kelimeleri dilimize giriş tarihine (1000–2026) göre filtreleme
- Canlı sözlük: TDK API ile güncel anlamlar ve örnek cümleler
- Yapay zeka analizi: Google Gemini ile her kelime için daha detaylı köken hikâyesi
- İstatistik paneli: dil ve dönem dağılımı grafikleri

## Teknolojiler

Next.js, TypeScript, Leaflet / React-Leaflet, Supabase (PostgreSQL), Google Gemini, Jawg Maps

## Katkı Sağlayın

Veritabanını ve içerikleri doğrudan uygulama üzerinden zenginleştirebilirsiniz. İlgili kelimeyi açtığınızda çıkan detay panelindeki iki butonu da bu amaçla kullanabilirsiniz.

- **Öneri:** daha iyi bir açıklama, ek kaynak veya etimolojik detay önerin.
- **Hata Bildir:** yanlış köken/dil bilgisi, yazım hatası ya da hatalı anlam gibi sorunları bildirin.

Açılan kısa formda bir konu başlığı seçip açıklamanızı yazın ve gönderin. Gönderiler zaman zaman
değerlendirilerek içerikler güncellenir.
