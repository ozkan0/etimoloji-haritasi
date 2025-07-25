// components/Map.tsx

import React from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Word, WordOnMap } from '../types';
import { PopupData } from './CustomPopup';

const MapClickHandler = ({ onClick }: { onClick: () => void }) => {
  useMapEvents({ click: () => onClick() });
  return null;
};

const FlyToMarker = ({ target }: { target: [number, number] | null }) => {
  const map = useMap();
  React.useEffect(() => {
    if (target) {
      const targetZoom = map.getZoom() < 8 ? 8 : map.getZoom();
      map.flyTo(target, targetZoom, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
};

// --- THIS IS THE FIX ---
// The `onShowDetails` prop has been removed from this interface.
interface MapProps {
  wordsOnMap: WordOnMap[];
  mapFlyToTarget: [number, number] | null;
  onMarkerClick: (data: PopupData) => void;
  onMapClick: () => void;
}

const Map: React.FC<MapProps> = ({ wordsOnMap, mapFlyToTarget, onMarkerClick, onMapClick }) => {
  const createWordIcon = (wordText: string) => {
    return L.divIcon({
      className: 'word-marker-icon',
      html: `<span>${wordText}</span>`,
      iconSize: 'auto' as any,
      iconAnchor: [0, 0],
    });
  };

  return (
    <MapContainer
      center={[39.9334, 32.8597]}
      zoom={4}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapClickHandler onClick={onMapClick} />
      <FlyToMarker target={mapFlyToTarget} />

      {wordsOnMap.map((word) => {
        if (isNaN(word.coordinates[0]) || isNaN(word.coordinates[1])) {
          return null;
        }

        return (
          <Marker 
            key={word.id} 
            position={word.coordinates}
            icon={createWordIcon(word.word)}
            eventHandlers={{
              click: (e) => {
                onMarkerClick({ word, position: e.containerPoint });
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
};

export default Map;