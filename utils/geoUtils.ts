import pointInPolygon from 'point-in-polygon';
import { Language } from '../types/types';

const seedRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const getPersistentCoordinates = (language: Language, seed: number): [number, number] => {
  const { boundingBox, polygon } = language;

  if (!boundingBox || !polygon || polygon.length === 0) {
    if (boundingBox) {
      const [minLat, minLng, maxLat, maxLng] = boundingBox;
      const lat = seedRandom(seed) * (maxLat - minLat) + minLat;
      const lng = seedRandom(seed + 1) * (maxLng - minLng) + minLng;
      return [lat, lng];
    }
    return [39.9334, 32.8597];
  }

  let randomPoint: [number, number];
  let isInside = false;
  let attempts = 0;

  do {
    const [minLat, minLng, maxLat, maxLng] = boundingBox;
    const lat = seedRandom(seed + attempts) * (maxLat - minLat) + minLat;
    const lng = seedRandom(seed + attempts + 1) * (maxLng - minLng) + minLng;

    randomPoint = [lng, lat]; 

    isInside = pointInPolygon(randomPoint, polygon[0]);
    attempts++;
  } while (!isInside && attempts < 100);

  return [randomPoint[1], randomPoint[0]];
};

export const getRandomCoordinatesInBoundingBox = (language: Language): [number, number] => {
  return getPersistentCoordinates(language, Math.random() * 1000000);
};