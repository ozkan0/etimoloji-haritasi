import type { GetStaticProps, NextPage } from 'next';
import { useState, useEffect, useCallback, useMemo } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Layouts & UI
import LeftSidebar from '../components/layout/LeftSidebar';
import RightDetailPanel from '../components/layout/RightDetailPanel';
import AboutPanel from '../components/layout/AboutPanel';
import StatsPanel from '../components/layout/StatsPanel';
import ToggleSidebarButton from '../components/ui/ToggleSidebarButton';
import ThemeSwitch from '../components/ui/ThemeSwitch';
import AboutButton from '../components/ui/AboutButton';
import StatsButton from '../components/ui/StatsButton';
import LoadingScreen from '../components/ui/LoadingScreen';
import MetaHead from '../components/ui/MetaHead';

// Features
import NewsTicker from '../components/features/news/NewsTicker';
import TimeSlider from '../components/features/timeline/TimeSlider';

// Logic / Types
import { Word, Language, WordOnMap } from '../types/types';
import { getRandomCoordinatesInBoundingBox } from '../utils/geoUtils';
import { useEtymologyData } from '../hooks/useEtymologyData';

const MapComponent = dynamic(() => import('../components/map/Map'), {
  ssr: false,
  loading: () => null, 
});

interface HomeProps {
  allLanguages: Language[];
}

const Home: NextPage<HomeProps> = ({ allLanguages = [] }) => {
  const router = useRouter();

  // --- DATA FETCHING ---
  const { sidebarWords, newsItems, isLoading } = useEtymologyData();

  // --- UI STATES ---
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isAboutPanelVisible, setIsAboutPanelVisible] = useState(false);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  
  // --- MAP DATA STATES ---
  const [wordsOnMap, setWordsOnMap] = useState<WordOnMap[]>([]);
  const [defaultMapWords, setDefaultMapWords] = useState<WordOnMap[]>([]); 
  
  // --- SELECTION & FILTER STATES ---
  const [detailPanelWord, setDetailPanelWord] = useState<Word | null>(null);
  const [mapFlyToTarget, setMapFlyToTarget] = useState<[number, number] | null>(null);
  const [filterTrigger, setFilterTrigger] = useState<{ type: 'language' | 'period', value: string, timestamp: number } | null>(null);

  const [selectedYear, setSelectedYear] = useState(2025);
  const [currentFilteredList, setCurrentFilteredList] = useState<Word[]>([]);
  const [isMapFilterActive, setIsMapFilterActive] = useState(false);

  const [currentActiveLang, setCurrentActiveLang] = useState('Tüm Diller');
  const [currentActivePeriod, setCurrentActivePeriod] = useState('Tüm Dönemler');
  const [limitPerLang, setLimitPerLang] = useState(5);

  // --- MAP GENERATION LOGIC ---
  const generateMapWords = useCallback((wordsToMap: Word[], limit: number) => {
    if (!allLanguages || allLanguages.length === 0) return [];

    const groupedWords: Record<string, Word[]> = {};
    wordsToMap.forEach(word => {
      const langKey = word.originLanguage.trim();
      if (!groupedWords[langKey]) groupedWords[langKey] = [];
      groupedWords[langKey].push(word);
    });

    let selectedWords: Word[] = [];
    Object.keys(groupedWords).forEach(lang => {
      const wordsInLang = groupedWords[lang];
      const shuffled = [...wordsInLang].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, limit); 
      selectedWords = [...selectedWords, ...picked];
    });

    return selectedWords.map((word: Word) => {
      const languageData = allLanguages.find((lang: Language) => 
        lang.language.toLowerCase() === word.originLanguage.trim().toLowerCase()
      );
      if (!languageData) return null;
      return {
        ...word,
        coordinates: getRandomCoordinatesInBoundingBox(languageData),
      };
    }).filter((word: WordOnMap | null): word is WordOnMap => word !== null);
  }, [allLanguages]);

  // --- INITIAL MAP POPULATION ---
  useEffect(() => {
    if (!isLoading && sidebarWords.length > 0) {
        setCurrentFilteredList(sidebarWords);

        // Generate default map
        const initialSet = generateMapWords(sidebarWords, 5);
        setWordsOnMap(initialSet);
        setDefaultMapWords(initialSet);
    }
  }, [isLoading, sidebarWords, generateMapWords]);

  // --- CENTRAL FILTERING (Map & Time) ---
  const mapSourceList = useMemo(() => {
    return isMapFilterActive ? currentFilteredList : sidebarWords;
  }, [isMapFilterActive, currentFilteredList, sidebarWords]);

  useEffect(() => {
    if (mapSourceList.length === 0) return;

    // Apply Time Filter
    const timeFilteredList = mapSourceList.filter(word => {
        if (!word.date) return true;
        const wDate = parseInt(String(word.date));
        if (isNaN(wDate)) return true;
        return wDate <= selectedYear;
    });

    // Default Case (No Filter, Present Year, Default Limit) -> Use Cached
    if (!isMapFilterActive && selectedYear >= 2025 && defaultMapWords.length > 0 && limitPerLang === 5) {
        setWordsOnMap(defaultMapWords);
    } else {
        const newMapSet = generateMapWords(timeFilteredList, limitPerLang);
        setWordsOnMap(newMapSet);
    }
  }, [selectedYear, mapSourceList, isMapFilterActive, defaultMapWords, generateMapWords, limitPerLang]);


  // --- HANDLERS ---

  const handleFilterChange = (filteredWords: Word[], applyToMap: boolean, activeLang: string, activePeriod: string, limit: number) => {
    setCurrentFilteredList(filteredWords);
    setIsMapFilterActive(applyToMap);
    setCurrentActiveLang(activeLang);
    setCurrentActivePeriod(activePeriod);
    setLimitPerLang(limit);
  };

  const handleWordSelect = useCallback((selectedWord: Word) => {
    if (!allLanguages) return;
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
      setWordsOnMap(prev => [...prev, newWordOnMap]);
      setMapFlyToTarget(newCoordinates);
    }
  }, [allLanguages, wordsOnMap]);

  const handleMarkerClick = (word: WordOnMap) => { setDetailPanelWord(word); };
  
  const handleQuickFilter = (type: 'language' | 'period', value: string) => {
    setFilterTrigger({ type, value, timestamp: Date.now() });
    setIsSidebarVisible(true);
  };

  const toggleSidebar = () => setIsSidebarVisible(prev => !prev);
  const toggleAboutPanel = () => setIsAboutPanelVisible(prev => !prev);

  // --- URL SYNC ---
  useEffect(() => {
    if (!router.isReady) return;
    const currentQuery = router.query.word;
    if (detailPanelWord) {
        if (currentQuery !== detailPanelWord.word) {
            router.push(`/?word=${detailPanelWord.word}`, undefined, { shallow: true });
        }
    } else {
        if (currentQuery) router.push('/', undefined, { shallow: true });
    }
  }, [detailPanelWord, router.isReady]);

  useEffect(() => {
    if (!router.isReady || sidebarWords.length === 0) return;
    const queryWord = router.query.word;
    if (queryWord && typeof queryWord === 'string') {
        if (detailPanelWord?.word !== queryWord) {
            const target = sidebarWords.find(w => w.word.toLowerCase() === queryWord.toLowerCase());
            if (target) handleWordSelect(target);
        }
    } else {
        if (detailPanelWord) setDetailPanelWord(null);
    }
  }, [router.isReady, router.query.word, sidebarWords, handleWordSelect]);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      
      <MetaHead selectedWord={detailPanelWord} />

      <LoadingScreen isLoading={isLoading} />
      <AboutButton onClick={toggleAboutPanel} />
      <StatsButton onClick={() => setIsStatsPanelOpen(true)} />
      
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
          onMapClick={() => {}} 
          selectedWordId={detailPanelWord?.id || null} 
        />
      </main>
      
      <TimeSlider 
        year={selectedYear} 
        onChange={setSelectedYear} 
        isLeftOpen={isSidebarVisible}
        isRightOpen={detailPanelWord !== null}
        disabled={isMapFilterActive} 
      />

      <NewsTicker newsItems={newsItems} />
      <ThemeSwitch />
      
      <RightDetailPanel 
        word={detailPanelWord} 
        onClose={() => setDetailPanelWord(null)} 
        onFilterTrigger={handleQuickFilter}
        activeFilterLanguage={currentActiveLang}
        activeFilterPeriod={currentActivePeriod}
      />
      <StatsPanel 
        isOpen={isStatsPanelOpen} 
        onClose={() => setIsStatsPanelOpen(false)} 
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