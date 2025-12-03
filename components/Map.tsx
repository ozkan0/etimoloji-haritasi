import React, {useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import { Word, WordOnMap } from '../types/types';
import { PopupData } from './CustomPopup';
import { useTheme } from '../context/ThemeContext';

const MapClickHandler = ({ onClick }: { onClick: () => void }) => {
  useMapEvents({ click: () => onClick() });
  return null;
};

const MarkerSizeUpdater = () => {
  const map = useMap();
  useEffect(() => {

    const updateMarkerSizes = () => {
      const zoom = map.getZoom();
      const markers = document.querySelectorAll('.word-marker-icon');

      markers.forEach((marker) => {
        const el = marker as HTMLElement;
        el.style.fontSize = '12px';
        el.style.padding = '3px 5px';
        el.style.fontWeight = '800';
        el.style.backgroundColor = "#C3E0E5";

        if (zoom == 5) {
          el.style.fontSize = '13px';
        } else if (zoom === 4) {
          el.style.fontSize = '12px';
        } else if (zoom === 3) {
          el.style.fontSize = '11px';
        }
      });
    };
    updateMarkerSizes();

    map.on('zoomend', updateMarkerSizes);

    return () => {
      map.off('zoomend', updateMarkerSizes);
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
  const { theme } = useTheme(); 
  // map boundaries to limit the map view
  const mapBounds: LatLngBoundsExpression = [
    [-40, -80], // Southwest Latitude, Longitude
    [75, 170],  // Northeast Latitude, Longitude
  ];
  const lightMapUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  
  const darkMapUrl = `https://{s}.tile.jawg.io/cff409a6-f8fe-4c7b-a746-46097db4ee20/{z}/{x}/{y}{r}.png?access-token=${process.env.NEXT_PUBLIC_JAWG_TOKEN}`;


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
      style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: '#191a1a' }}
      maxBounds={mapBounds}
      minZoom={4}
      maxZoom={7}
      zoomControl={false}
    >
      
      <PopupPositionUpdater 
        activePopup={activePopupData} 
        onUpdate={onPopupPositionUpdate}  
      />
      {theme === 'light' ? (
        <TileLayer
        key={theme}
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
          url={lightMapUrl}
        />
      ) : (
        <TileLayer
          attribution='<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">© <b>Jawg</b>Maps</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={darkMapUrl}
        />
      )}
      
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
      <MarkerSizeUpdater />
      <ZoomControl position="topright" />
    </MapContainer>
  );
};

export default Map;