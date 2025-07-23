// components/Map.tsx (DÜZELTİLMİŞ VERSİYON)

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Word, WordOnMap } from '../types';

// Marker iconunun varsayılan yolunu düzeltiyoruz.
// Leaflet'in varsayılan ikonları Next.js ile doğru çalışmayabilir, bu yüzden bu fix gereklidir.
// ÖNCEKİ HATALI SATIR BURADAYDI. ŞİMDİ DOĞRUSU YAZIYOR.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Haritanın akıcı bir şekilde belirli bir noktaya uçmasını sağlayan yardımcı bileşen.
interface FlyToMarkerProps {
  target: [number, number] | null;
}

const FlyToMarker: React.FC<FlyToMarkerProps> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target, map.getZoom() < 8 ? 8 : map.getZoom(), {
        duration: 1.5,
      });
    }
  }, [target, map]);

  return null;
};


// DEĞİŞİKLİK 2: MapProps'a yeni bir fonksiyon prop'u ekliyoruz.
interface MapProps {
  wordsOnMap: WordOnMap[];
  mapFlyToTarget: [number, number] | null;
  onShowDetails: (word: Word) => void; // Detayları göster butonuna tıklandığında çalışacak fonksiyon
}

const Map: React.FC<MapProps> = ({ wordsOnMap, mapFlyToTarget, onShowDetails }) => {
  const initialCenter: [number, number] = [39.9334, 32.8597];
  const initialZoom = 4;

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <FlyToMarker target={mapFlyToTarget} />

      {wordsOnMap.map((word) => (
        <Marker key={word.id} position={word.coordinates}>
          <Popup>
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{word.word}</h3>
              <p style={{ margin: '4px 0' }}><strong>Köken:</strong> {word.originLanguage}</p>
              <p style={{ margin: '4px 0' }}><strong>Örnek:</strong> "{word.exampleSentence}"</p>
              {/* DEĞİŞİKLİK 3: Butonu ekliyor ve onShowDetails fonksiyonuna bağlıyoruz. */}
              <button
                onClick={() => onShowDetails(word)}
                style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer', border: '1px solid #00695c', backgroundColor: '#00695c', color: 'white', borderRadius: '4px' }}
              >
                Detayları Göster
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;