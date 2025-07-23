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
  const [popupToOpen, setPopupToOpen] = useState<number | null>(null);

  useEffect(() => {
    if (allLanguages && allLanguages.length > 0) {
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
    }
  }, [allWords, allLanguages]);

  
  const handleWordSelect = (selectedWord: Word) => {
    const existingWord = wordsOnMap.find(w => w.id === selectedWord.id);
    
    // --- THIS IS THE NEW LOGIC ---
    // Check if the detail panel is currently open.
    if (detailPanelWord) {
      // If it is open, update it with the new word that was just clicked.
      setDetailPanelWord(selectedWord);
    }
    // --- END OF NEW LOGIC ---

    if (existingWord) {
      setMapFlyToTarget(existingWord.coordinates);
      setPopupToOpen(existingWord.id);
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
      setPopupToOpen(newWordOnMap.id);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Head>
        <title>Etimoloji Haritası</title>
        <meta name="description" content="Türkçe kelimelerin etimolojik köken haritası" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LeftSidebar allWords={allWords} onWordSelect={handleWordSelect} />

      <main style={{ flex: 1, display: 'flex' }}>
        <MapComponent 
          wordsOnMap={wordsOnMap} 
          mapFlyToTarget={mapFlyToTarget} 
          onShowDetails={(word) => setDetailPanelWord(word)}
          popupToOpen={popupToOpen}
          onPopupClose={() => setPopupToOpen(null)}
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
  const languagesFilePath = path.join(dataDirectory, 'languages.json');
  const languagesJsonData = await fs.readFile(languagesFilePath, 'utf8');
  const allLanguages: Language[] = JSON.parse(languagesJsonData);
  return {
    props: {
      allWords,
      allLanguages,
    },
  };
};