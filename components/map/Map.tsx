import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import { WordOnMap } from '../../types/types';
import { useTheme } from '../../context/ThemeContext';

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
      if (zoom >= 6) container.classList.add('map-zoom-high');
      else if (zoom >= 5) container.classList.add('map-zoom-mid');
      else container.classList.add('map-zoom-low');
    };
    updateZoomClasses();
    map.on('zoom', updateZoomClasses);
    return () => { map.off('zoom', updateZoomClasses); };
  }, [map]);
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

const createWordIcon = (wordText: string, isSelected: boolean) => {
  const activeClass = isSelected ? 'active' : '';
  
  return L.divIcon({
    className: 'word-marker-container',
    html: `<div class="modern-marker ${activeClass}">${wordText}</div>`,
    iconSize: null as any, 
    iconAnchor: [0, 0],
  });
};

const WordMarker = React.memo(({ word, isSelected, onClick }: { word: WordOnMap, isSelected: boolean, onClick: (e: any) => void }) => {
  const icon = useMemo(() => createWordIcon(word.word, isSelected), [word.word, isSelected]);

  return (
    <Marker 
      position={word.coordinates}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: onClick,
      }}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.word.id === nextProps.word.id && 
         prevProps.word.coordinates[0] === nextProps.word.coordinates[0] &&
         prevProps.word.coordinates[1] === nextProps.word.coordinates[1] &&
         prevProps.isSelected === nextProps.isSelected;
});

interface MapProps {
  wordsOnMap: WordOnMap[];
  mapFlyToTarget: [number, number] | null;
  onMarkerClick: (word: WordOnMap) => void;
  onMapClick: () => void;
  selectedWordId: number | null;
}

const Map: React.FC<MapProps> = ({ 
  wordsOnMap, 
  mapFlyToTarget, 
  onMarkerClick, 
  onMapClick, 
  selectedWordId 
}) => {
  const { theme } = useTheme(); 
  const mapBounds: LatLngBoundsExpression = [[-40, -80], [75, 170]];
  const lightMapUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const darkMapUrl = `https://{s}.tile.jawg.io/cff409a6-f8fe-4c7b-a746-46097db4ee20/{z}/{x}/{y}{r}.png?access-token=${process.env.NEXT_PUBLIC_JAWG_TOKEN}`;

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
          <WordMarker 
            key={word.id} 
            word={word} 
            isSelected={selectedWordId === word.id} 
            onClick={(e) => {
               L.DomEvent.stopPropagation(e);
               onMarkerClick(word);
            }} 
          />
        );
      })}
      
      <ZoomControl position="topright" />
    </MapContainer>
  );
};

export default Map;