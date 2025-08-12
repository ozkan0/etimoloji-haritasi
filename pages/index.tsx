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
import { Word, Language, WordOnMap } from '../types/types';
import { supabase } from '../lib/supabaseClient';
import pointInPolygon from 'point-in-polygon';
import NewsTicker from '../components/NewsTicker';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitch from '../components/ThemeSwitch';

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
const getRandomCoordinatesInBoundingBox = (language: Language): [number, number] => {
  const { boundingBox, polygon } = language;

  if (!boundingBox || !polygon || polygon.length === 0) {
    console.error("Missing boundingBox or polygon for language:", language.language);

    if (boundingBox) {
        const [minLat, minLng, maxLat, maxLng] = boundingBox;
        const lat = Math.random() * (maxLat - minLat) + minLat;
        const lng = Math.random() * (maxLng - minLng) + minLng;
        return [lat, lng];
    }
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

  if (!isInside) {
    console.warn("Could not find a point inside the polygon for:", language.language, "using last attempt.");
  }

  return [randomPoint[1], randomPoint[0]]; 
};


const Home: NextPage<HomeProps> = ({ allLanguages }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [wordsOnMap, setWordsOnMap] = useState<WordOnMap[]>([]);
  const [detailPanelWord, setDetailPanelWord] = useState<Word | null>(null);
  const [mapFlyToTarget, setMapFlyToTarget] = useState<[number, number] | null>(null);
  const [activePopupData, setActivePopupData] = useState<PopupData | null>(null);
  
  const [sidebarWords, setSidebarWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsItems, setNewsItems] = useState<{ id: number, text: string }[]>([]);


  useEffect(() => {
    const fetchInitialWords = async () => {
      setIsLoading(true);
      
      const { data: randomWords, error } = await supabase.rpc('get_random_words', { limit_count: 50 });

      // --- NEW: Fetch news items ---
      const { data: newsData, error: newsError } = await supabase
        .from('news') // Assume your table is named 'news'
        .select('id, text'); // Select the id and text columns
      
      
        if (error) {
        console.error('Error fetching initial words:', error);
      } else if (randomWords) {
        setSidebarWords(randomWords);

      if (newsError) {
        console.error('Error fetching news:', newsError);
      } else {
        setNewsItems(newsData || []);
      }
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
            coordinates: getRandomCoordinatesInBoundingBox(languageData),
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
      const newCoordinates = getRandomCoordinatesInBoundingBox(languageData);
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
      <NewsTicker newsItems={newsItems} />
      <ThemeSwitch />

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