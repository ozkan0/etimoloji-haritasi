import React from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Word, WordOnMap } from '../types';
import { PopupData } from './CustomPopup';

const MapClickHandler = ({ onClick }: { onClick: () => void }) => {
  useMapEvents({ click: () => onClick() });
  return null;
};
const PopupPositionUpdater = ({ activePopup, onUpdate }: { activePopup: PopupData | null; onUpdate: (newPosition: { x: number, y: number }) => void; }) => {
  const map = useMap();
  
  useMapEvents({
    move() {
      if (activePopup) {
        const newScreenPosition = map.latLngToContainerPoint(activePopup.latlng);
        onUpdate(newScreenPosition);
      }
    },
  });

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
interface MapProps {
  wordsOnMap: WordOnMap[];
  mapFlyToTarget: [number, number] | null;
  onMarkerClick: (data: PopupData) => void;
  onMapClick: () => void;
  activePopupData: PopupData | null;
  onPopupPositionUpdate: (newPosition: { x: number, y: number }) => void;
}

const Map: React.FC<MapProps> = ({ wordsOnMap, mapFlyToTarget, onMarkerClick, onMapClick, activePopupData, onPopupPositionUpdate }) => {
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
      
      <PopupPositionUpdater 
        activePopup={activePopupData} 
        onUpdate={onPopupPositionUpdate}  
      />
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
                onMarkerClick({ word, position: e.containerPoint, latlng: e.latlng });
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
};

export default Map;