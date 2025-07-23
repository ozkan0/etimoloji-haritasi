// pages/index.tsx (SAĞ DETAY PANELİ EKLENMİŞ, TAM VE SON HALİ)


import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import dynamic from 'next/dynamic';
import LeftSidebar from '../components/LeftSidebar';
import RightDetailPanel from '../components/RightDetailPanel';


import { Word, Language, WordOnMap } from '../types';

const MapComponent = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <p style={{ flex: 1, textAlign: 'center', alignSelf: 'center' }}>Harita Yükleniyor...</p>,
});


interface HomeProps {
  allWords: Word[];
  allLanguages: Language[];
}

const getRandomCoordinatesInBoundingBox = (boundingBox: [number, number, number, number]): [number, number] => {
  const [minLat, minLng, maxLat, maxLng] = boundingBox;
  const lat = Math.random() * (maxLat - minLat) + minLat;
  const lng = Math.random() * (maxLng - minLng) + minLng;
  return [lat, lng];
};


const Home: NextPage<HomeProps> = ({ allWords, allLanguages }) => {
  const [wordsOnMap, setWordsOnMap] = useState<WordOnMap[]>([]);
  const [detailPanelWord, setDetailPanelWord] = useState<Word | null>(null);
  const [mapFlyToTarget, setMapFlyToTarget] = useState<[number, number] | null>(null);

  useEffect(() => {
    const initialWords: WordOnMap[] = [];
    const wordsByLanguage = new Map<string, Word[]>();

    allWords.forEach(word => {
      if (!wordsByLanguage.has(word.originLanguage)) {
        wordsByLanguage.set(word.originLanguage, []);
      }
      wordsByLanguage.get(word.originLanguage)!.push(word);
    });

    wordsByLanguage.forEach((wordsInLang, languageName) => {
      const languageData = allLanguages.find(lang => lang.language === languageName);
      if (!languageData) return;

      const shuffled = [...wordsInLang].sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, 2);

      selectedWords.forEach(word => {
        initialWords.push({
          ...word,
          coordinates: getRandomCoordinatesInBoundingBox(languageData.boundingBox),
        });
      });
    });
    
    setWordsOnMap(initialWords);
  }, [allWords, allLanguages]);

  const handleWordSelect = (selectedWord: Word) => {
    const existingWord = wordsOnMap.find(w => w.id === selectedWord.id);

    if (existingWord) {
      setMapFlyToTarget(existingWord.coordinates);
    } else {
      const languageData = allLanguages.find(lang => lang.language === selectedWord.originLanguage);
      if (!languageData) {
        console.error("Kelimenin köken dili için harita verisi bulunamadı:", selectedWord.originLanguage);
        return;
      }
      
      const newCoordinates = getRandomCoordinatesInBoundingBox(languageData.boundingBox);
      const newWordOnMap: WordOnMap = {
        ...selectedWord,
        coordinates: newCoordinates,
      };

      setWordsOnMap(prevWords => [...prevWords, newWordOnMap]);
      setMapFlyToTarget(newCoordinates);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Head>
        <title>Etimoloji Haritası</title>
        <meta name="description" content="Türkçe kelimelerin etimolojik köken haritası" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossOrigin=""/>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      </Head>

      <LeftSidebar allWords={allWords} onWordSelect={handleWordSelect} />

      <main style={{ flex: 1, display: 'flex' }}>
        <MapComponent 
          wordsOnMap={wordsOnMap} 
          mapFlyToTarget={mapFlyToTarget} 
          onShowDetails={(word) => setDetailPanelWord(word)}
        />
      </main>

      <RightDetailPanel 
        word={detailPanelWord} 
        onClose={() => setDetailPanelWord(null)} 
      />
    </div>
  );
};

export default Home;


export const getStaticProps: GetStaticProps = async () => {
  const dataDirectory = path.join(process.cwd(), 'data');

  const wordsFilePath = path.join(dataDirectory, 'words.json');
  const wordsJsonData = await fs.readFile(wordsFilePath, 'utf8');
  const allWords: Word[] = JSON.parse(wordsJsonData);

  // languages.json dosyasını oku
  const languagesFilePath = path.join(dataDirectory, 'languages.json');
  const languagesJsonData = await fs.readFile(languagesFilePath, 'utf8');
  const allLanguages: Language[] = JSON.parse(languagesJsonData);

  return {
    props: {
      allWords,
      allLanguages, // countries yerine languages gönder
    },
  };
};