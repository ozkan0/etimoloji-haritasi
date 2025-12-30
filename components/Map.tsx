import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import { WordOnMap } from '../types/types';
import { PopupData } from './CustomPopup';
import { useTheme } from '../context/ThemeContext';

const MapClickHandler = ({ onClick }: { onClick: () => void }) => {
  useMapEvents({ click: () => onClick() });
  return null;
};

const MapZoomHandler = () => {
  const map = useMap();
  
  useEffect(() => {
    const container = map.getContainer();

    const updateZoomClasses = () => {
      const zoom = map.getZoom();
      
      container.classList.remove('map-zoom-low', 'map-zoom-mid', 'map-zoom-high');

      if (zoom >= 6) {
        container.classList.add('map-zoom-high');
      } else if (zoom >= 5) {
        container.classList.add('map-zoom-mid');
      } else {
        container.classList.add('map-zoom-low');
      }
    };

    updateZoomClasses();

    map.on('zoom', updateZoomClasses);

    return () => {
      map.off('zoom', updateZoomClasses);
    };
  }, [map]);

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
      const targetZoom = map.getZoom() < 7 ? 7 : map.getZoom();
      map.flyTo(target, targetZoom, { duration: 1.5, easeLinearity: 0.25 });
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
  const { theme } = useTheme(); 
  
  const mapBounds: LatLngBoundsExpression = [
    [-40, -80], 
    [75, 170], 
  ];

  const lightMapUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const darkMapUrl = `https://{s}.tile.jawg.io/cff409a6-f8fe-4c7b-a746-46097db4ee20/{z}/{x}/{y}{r}.png?access-token=${process.env.NEXT_PUBLIC_JAWG_TOKEN}`;

  const createWordIcon = (wordText: string) => {
    return L.divIcon({
      className: 'word-marker-container',
      html: `<div class="modern-marker">${wordText}</div>`,
      iconSize: null as any, 
      iconAnchor: [0, 0],
    });
  };

  return (
    <MapContainer
      center={[39.9334, 32.8597]}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: theme === 'light' ? '#e3f7ff' : '#191a1a' }}
      maxBounds={mapBounds}
      minZoom={4}
      maxZoom={7}
      zoomControl={false}
    >
      <MapZoomHandler />

      <PopupPositionUpdater 
        activePopup={activePopupData} 
        onUpdate={onPopupPositionUpdate}  
      />
      
      <TileLayer
        key={theme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={theme === 'light' ? lightMapUrl : darkMapUrl}
      />
      
      <MapClickHandler onClick={onMapClick} />
      <FlyToMarker target={mapFlyToTarget} />

      {wordsOnMap.map((word) => {
        if (isNaN(word.coordinates[0]) || isNaN(word.coordinates[1])) return null;

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
      
      <ZoomControl position="topright" />
    </MapContainer>
  );
};

export default Map;