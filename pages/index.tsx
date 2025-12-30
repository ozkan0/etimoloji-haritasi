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
import ThemeSwitch from '../components/ThemeSwitch';
import AboutButton from '../components/AboutButton';
import AboutPanel from '../components/AboutPanel';
import LoadingScreen from '../components/LoadingScreen';


const MapComponent = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => null, 
});

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
  const [isLoading, setIsLoading] = useState(true); // BU STATE ARTIK KRİTİK
  const [newsItems, setNewsItems] = useState<{ id: number, text: string }[]>([]);
  const [isAboutPanelVisible, setIsAboutPanelVisible] = useState(false);


  useEffect(() => {
    const fetchInitialWords = async () => {
      setIsLoading(true);
      
      const { data: randomWords, error } = await supabase.rpc('get_random_words', { limit_count: 200 });

      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('id, text');
        
      if (newsError) console.error('Error fetching news:', newsError);
      else setNewsItems(newsData || []);

      if (error) {
        console.error('Error fetching initial words:', error);
      } else if (randomWords) {
        setSidebarWords(randomWords);
        
        const INITIAL_MAP_WORD_COUNT = 35;
        const wordsForMap = randomWords.slice(0, INITIAL_MAP_WORD_COUNT);

        const initialMapWords: WordOnMap[] = wordsForMap.map((word: Word) => {
          const languageData = allLanguages.find((lang: Language) => lang.language === word.originLanguage);
          if (!languageData) return null;
          
          return {
            ...word,
            coordinates: getRandomCoordinatesInBoundingBox(languageData),
          };
        }).filter((word: WordOnMap | null): word is WordOnMap => word !== null);

        setWordsOnMap(initialMapWords);
      }

      setTimeout(() => {
         setIsLoading(false);
      }, 1500);
    };
    fetchInitialWords();
  }, [allLanguages]);

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const handleWordSelect = (selectedWord: Word) => {
    const languageData = allLanguages.find(lang => lang.language === selectedWord.originLanguage);
    if (!languageData || !languageData.boundingBox) return;
    
    setDetailPanelWord(selectedWord);

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
    setDetailPanelWord(data.word);
  };
  
  const handleClosePopups = () => setActivePopupData(null);
  
  const handlePopupPositionUpdate = (newPosition: { x: number, y: number }) => {
    setActivePopupData(prevData => {
      if (!prevData) return null;
      return { ...prevData, position: newPosition };
    });
  };
  
  const toggleAboutPanel = () => setIsAboutPanelVisible(prev => !prev);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <Head>
        <title>Etimoloji Haritası</title>
        <meta name="description" content="Türkçe kelimelerin etimolojik köken haritası" />
      </Head>

      <LoadingScreen isLoading={isLoading} />

      <AboutButton onClick={toggleAboutPanel} />
      <AboutPanel isVisible={isAboutPanelVisible} onClose={() => setIsAboutPanelVisible(false)} />
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