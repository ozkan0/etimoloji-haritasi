import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
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
  
    return [randomPoint[1], randomPoint[0]]; 
  };

const Home: NextPage<HomeProps> = ({ allLanguages }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  
  // Maps & Words States
  const [wordsOnMap, setWordsOnMap] = useState<WordOnMap[]>([]);
  const [defaultMapWords, setDefaultMapWords] = useState<WordOnMap[]>([]); 
  const [sidebarWords, setSidebarWords] = useState<Word[]>([]);
  
  // UI States
  const [detailPanelWord, setDetailPanelWord] = useState<Word | null>(null);
  const [filterTrigger, setFilterTrigger] = useState<{ type: 'language' | 'period', value: string, timestamp: number } | null>(null);
  const [mapFlyToTarget, setMapFlyToTarget] = useState<[number, number] | null>(null);
  const [activePopupData, setActivePopupData] = useState<PopupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newsItems, setNewsItems] = useState<{ id: number, text: string }[]>([]);
  const [isAboutPanelVisible, setIsAboutPanelVisible] = useState(false);

  const generateMapWords = useCallback((wordsToMap: Word[]) => {
    const groupedWords: Record<string, Word[]> = {};
    
    wordsToMap.forEach(word => {
      const langKey = word.originLanguage.trim();
      if (!groupedWords[langKey]) {
        groupedWords[langKey] = [];
      }
      groupedWords[langKey].push(word);
    });

    let selectedWords: Word[] = [];
    const MAX_WORDS_PER_LANGUAGE = 5;

    Object.keys(groupedWords).forEach(lang => {
      const wordsInLang = groupedWords[lang];
      const shuffled = [...wordsInLang].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, MAX_WORDS_PER_LANGUAGE);
      selectedWords = [...selectedWords, ...picked];
    });

    return selectedWords.map((word: Word) => {
      const languageData = allLanguages.find((lang: Language) => 
        lang.language.toLowerCase() === word.originLanguage.trim().toLowerCase()
      );
      
      if (!languageData) {
        return null; 
      }
      
      return {
        ...word,
        coordinates: getRandomCoordinatesInBoundingBox(languageData),
      };
    }).filter((word: WordOnMap | null): word is WordOnMap => word !== null);
  }, [allLanguages]);

  useEffect(() => {
    const fetchInitialWords = async () => {
      setIsLoading(true);
      
      const { data: rawData, error } = await supabase.rpc('get_random_words', { limit_count: 2000 });
      
      const { data: newsData, error: newsError } = await supabase.from('news').select('id, text');
      if (!newsError) setNewsItems(newsData || []);

      if (error) {
        console.error('Veri çekme hatası:', error);
        setTimeout(() => setIsLoading(false), 1000);
      } else if (rawData) {
        const formattedWords: Word[] = rawData.map((w: any) => ({
            id: w.id,
            word: w.word,
            originLanguage: w.originLanguage || w.originlanguage || w.origin_language || 'Bilinmiyor',
            period: w.period,
            source: w.source,
            date: w.date
        }));
        setSidebarWords(formattedWords);
        
        const initialSet = generateMapWords(formattedWords);
        setWordsOnMap(initialSet);
        setDefaultMapWords(initialSet);

        setTimeout(() => { setIsLoading(false); }, 1500);
      }
    };

    fetchInitialWords();
  }, [generateMapWords]);

  const handleFilterChange = (filteredWords: Word[], applyToMap: boolean) => {
    if (applyToMap) {
        const newMapSet = generateMapWords(filteredWords);
        setWordsOnMap(newMapSet);
    } else {
        if (defaultMapWords.length > 0) {
            setWordsOnMap(defaultMapWords);
        }
    }
  };

  const handleWordSelect = (selectedWord: Word) => {
    const languageData = allLanguages.find(lang => 
      lang.language.toLowerCase() === selectedWord.originLanguage.trim().toLowerCase()
    );
    
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

  const handleQuickFilter = (type: 'language' | 'period', value: string) => {
    setFilterTrigger({
        type,
        value,
        timestamp: Date.now() // Her tıklamada değişsin ki useEffect algılasın
    });
    // Mobildeysek veya sidebar kapalıysa, sidebarı açalım ki filtreyi görsün
    setIsSidebarVisible(true);
  };
  const toggleSidebar = () => setIsSidebarVisible(prev => !prev);

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
        onFilterChange={handleFilterChange} 
        externalFilterTrigger={filterTrigger}
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
        onFilterTrigger={handleQuickFilter}
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