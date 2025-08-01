import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import dynamic from 'next/dynamic';
import LeftSidebar from '../components/LeftSidebar';
import RightDetailPanel from '../components/RightDetailPanel';
import CustomPopup, { PopupData } from '../components/CustomPopup';
import ToggleSidebarButton from '../components/ToggleSidebarButton';
import { Word, Language, WordOnMap } from '../types';
import { supabase } from '../lib/supabaseClient';

const MapComponent = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <p style={{ flex: 1, textAlign: 'center', alignSelf: 'center' }}>Harita Yükleniyor...</p>,
});

interface ToggleSidebarButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

interface HomeProps {
  allLanguages: Language[];
}

const getRandomCoordinatesInBoundingBox = (boundingBox: [number, number, number, number]): [number, number] => {
  if (!boundingBox || !Array.isArray(boundingBox) || boundingBox.length !== 4 || boundingBox.some(isNaN)) {
    return [39.9334, 32.8597]; 
  }
  const [minLat, minLng, maxLat, maxLng] = boundingBox;
  const lat = Math.random() * (maxLat - minLat) + minLat;
  const lng = Math.random() * (maxLng - minLng) + minLng;
  return [lat, lng];
};

const Home: NextPage<HomeProps> = ({ allLanguages }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [wordsOnMap, setWordsOnMap] = useState<WordOnMap[]>([]);
  const [detailPanelWord, setDetailPanelWord] = useState<Word | null>(null);
  const [mapFlyToTarget, setMapFlyToTarget] = useState<[number, number] | null>(null);
  const [activePopupData, setActivePopupData] = useState<PopupData | null>(null);
  // --- NEW STATE: To store the words for the sidebar list ---
  const [sidebarWords, setSidebarWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchInitialWords = async () => {
      setIsLoading(true);
      
      const { data: randomWords, error } = await supabase.rpc('get_random_words', { limit_count: 50 });

      if (error) {
        console.error('Error fetching initial words:', error);
      } else if (randomWords) {
        setSidebarWords(randomWords);

        const initialMapWords: WordOnMap[] = [];
        const wordsByLanguage = new Map<string, Word[]>();
        
        randomWords.forEach((word: Word) => {
          if (!wordsByLanguage.has(word.originLanguage)) {
            wordsByLanguage.set(word.originLanguage, []);
          }
          wordsByLanguage.get(word.originLanguage)!.push(word);
        });

        wordsByLanguage.forEach((wordsInLang, languageName) => {
          const languageData = allLanguages.find(lang => lang.language === languageName);
          if (!languageData) return;
          const selectedWord = wordsInLang[0];
          initialMapWords.push({
            ...selectedWord,
            coordinates: getRandomCoordinatesInBoundingBox(languageData.boundingBox),
          });
        });
        
        setWordsOnMap(initialMapWords);
      }
      setIsLoading(false);
    };
    fetchInitialWords();
  }, [allLanguages]);

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const handleWordSelect = (selectedWord: Word) => {
    const languageData = allLanguages.find(lang => lang.language === selectedWord.originLanguage);
    if (!languageData || !languageData.boundingBox) {
      return;
    }
    if (detailPanelWord) {
      setDetailPanelWord(selectedWord);
    }
    const existingWord = wordsOnMap.find(w => w.id === selectedWord.id);
    if (existingWord) {
      setMapFlyToTarget(existingWord.coordinates);
    } else {
      const newCoordinates = getRandomCoordinatesInBoundingBox(languageData.boundingBox);
      const newWordOnMap: WordOnMap = { ...selectedWord, coordinates: newCoordinates };
      setWordsOnMap(prevWords => [...prevWords, newWordOnMap]);
      setMapFlyToTarget(newCoordinates);
    }
    setActivePopupData(null);
  };

  const handleMarkerClick = (data: PopupData) => {
    if (activePopupData && activePopupData.word.id === data.word.id) {
      setActivePopupData(null);
    } else {
      setActivePopupData(data);
    }
  };
  
  const handleClosePopups = () => {
    setActivePopupData(null);
  };
  const handlePopupPositionUpdate = (newPosition: { x: number, y: number }) => {
    setActivePopupData(prevData => {
      if (!prevData) return null;
      return { ...prevData, position: newPosition };
    });
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <Head>
        <title>Etimoloji Haritası</title>
        <meta name="description" content="Türkçe kelimelerin etimolojik köken haritası" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <ToggleSidebarButton isVisible={isSidebarVisible} onClick={toggleSidebar} />
      
      <LeftSidebar 
        allWords={sidebarWords}
        onWordSelect={handleWordSelect} 
        isVisible={isSidebarVisible} 
      />

      <main style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
        <MapComponent 
          wordsOnMap={wordsOnMap} 
          mapFlyToTarget={mapFlyToTarget} 
          onMarkerClick={handleMarkerClick}
          onMapClick={handleClosePopups}
          activePopupData={activePopupData}
          onPopupPositionUpdate={handlePopupPositionUpdate}
        />
      </main>

      <CustomPopup 
        data={activePopupData}
        onClose={handleClosePopups}
        onShowDetails={(word) => {
          setDetailPanelWord(word);
          setActivePopupData(null);
        }}
      />
      
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
  const languagesFilePath = path.join(dataDirectory, 'languages.json');
  const languagesJsonData = await fs.readFile(languagesFilePath, 'utf8');
  const allLanguages: Language[] = JSON.parse(languagesJsonData);

  return {
    props: {
      allLanguages,
    },
  };
};