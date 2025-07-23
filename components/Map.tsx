import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { Marker as MarkerType } from 'leaflet';
import { Word, WordOnMap } from '../types';

// Helper component to handle map interactions
interface MapControllerProps {
  mapFlyToTarget: [number, number] | null;
  popupToOpen: number | null;
  markerRefs: React.MutableRefObject<{[key: number]: MarkerType | null}>;
}

const MapController: React.FC<MapControllerProps> = ({ mapFlyToTarget, popupToOpen, markerRefs }) => {
  const map = useMap();

  // Effect for flying to a target
  useEffect(() => {
    if (mapFlyToTarget) {
      const targetZoom = map.getZoom() < 8 ? 8 : map.getZoom();
      map.flyTo(mapFlyToTarget, targetZoom, {
        duration: 1.5,
      });
    }
  }, [mapFlyToTarget, map]);

  // Effect for opening a popup
  useEffect(() => {
    if (popupToOpen !== null) {
      const markerToOpen = markerRefs.current[popupToOpen];
      if (markerToOpen) {
        setTimeout(() => {
          markerToOpen.openPopup();
        }, 800);
      }
    }
  }, [popupToOpen, map, markerRefs]);

  return null;
};


// Main Map Component props
interface MapProps {
  wordsOnMap: WordOnMap[];
  mapFlyToTarget: [number, number] | null;
  onShowDetails: (word: Word) => void;
  popupToOpen: number | null;
  onPopupClose: () => void;
}

const Map: React.FC<MapProps> = ({ wordsOnMap, mapFlyToTarget, onShowDetails, popupToOpen, onPopupClose }) => {
  const initialCenter: [number, number] = [39.9334, 32.8597];
  const initialZoom = 4;
  const markerRefs = useRef<{[key: number]: MarkerType | null}>({});

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });

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
      
      <MapController 
        mapFlyToTarget={mapFlyToTarget}
        popupToOpen={popupToOpen}
        markerRefs={markerRefs}
      />

      {wordsOnMap.map((word) => (
        <Marker 
          key={word.id} 
          position={word.coordinates}
          ref={(el: any) => (markerRefs.current[word.id] = el)}
        >
          <Popup
            eventHandlers={{
              remove: () => onPopupClose(),
            }}
          >
            <div>
              <h3>{word.word}</h3>
              <p><strong>Köken:</strong> {word.originLanguage}</p>
              <p><strong>Örnek:</strong> "{word.exampleSentence}"</p>
              <button onClick={() => onShowDetails(word)} style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer', border: '1px solid #00695c', backgroundColor: '#00695c', color: 'white', borderRadius: '4px' }}>
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