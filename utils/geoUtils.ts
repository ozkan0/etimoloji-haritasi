import pointInPolygon from 'point-in-polygon';
import { Language } from '../types/types';

/**
 * Generates a random coordinate within the bounding box (and polygon if available) of a language.
 */
export const getRandomCoordinatesInBoundingBox = (language: Language): [number, number] => {
  const { boundingBox, polygon } = language;

  // Safety check
  if (!boundingBox || !polygon || polygon.length === 0) {
    if (boundingBox) {
      const [minLat, minLng, maxLat, maxLng] = boundingBox;
      const lat = Math.random() * (maxLat - minLat) + minLat;
      const lng = Math.random() * (maxLng - minLng) + minLng;
      return [lat, lng];
    }
    // Default fallback (Turkey center)
    return [39.9334, 32.8597];
  }

  let randomPoint: [number, number];
  let isInside = false;
  let attempts = 0;

  do {
    const [minLat, minLng, maxLat, maxLng] = boundingBox;
    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;
    
    randomPoint = [lng, lat]; 
    
    isInside = pointInPolygon(randomPoint, polygon[0]);
    attempts++;
  } while (!isInside && attempts < 100);

  return [randomPoint[1], randomPoint[0]];
};