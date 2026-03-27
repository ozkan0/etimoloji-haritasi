import type { GetStaticProps, NextPage } from 'next';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import ToggleRightSidebarButton from '../components/ui/ToggleRightSidebarButton';
import SettingsMenu from '../components/ui/SettingsMenu';
import LoadingScreen from '../components/ui/LoadingScreen';
import MetaHead from '../components/ui/MetaHead';

// Features
import NewsTicker from '../components/features/news/NewsTicker';
import TimeSlider from '../components/features/timeline/TimeSlider';

// Logic / Types
import { Word, Language, WordOnMap } from '../types/types';
import { getRandomCoordinatesInBoundingBox } from '../utils/geoUtils';
import { useEtymologyData } from '../hooks/useEtymologyData';
import { wordService } from '../services/wordService';

const mapOriginLanguageToTurkish = (lang: string): string => {
  const codeMap: Record<string, string> = {
    // Turkic / Central Asian
    'Eski Türkçe': 'Eski Türkçe',
    'Karahanlıca': 'Eski Türkçe',
    'Uygurca': 'Eski Türkçe',
    'Yakutça': 'Eski Türkçe',
    'Çuvaşça': 'Eski Türkçe',

    'Orta Türkçe': 'Orta Türkçe',
    'Çağatayca': 'Orta Türkçe',
    'Kıpçakça': 'Orta Türkçe',
    'Harezmce': 'Orta Türkçe',
    'Kazakça': 'Orta Türkçe',
    'Özbekçe': 'Orta Türkçe',
    'Türkmence': 'Orta Türkçe',
    'Kırgızca': 'Orta Türkçe',
    'Tatarca': 'Orta Türkçe',

    'Türkiye Türkçesi': 'Türkçe',
    'Yeni Türkçe': 'Türkçe',
    'Azerice': 'Türkçe',
    'Gagauzca': 'Türkçe',

    // Meso & Levant
    'Akatça': 'Süryanice',
    'Sümerce': 'Süryanice',
    'Aramice': 'Süryanice',

    // Indo-European overrides
    'Yeni Latince': 'Latince',
    'Orta Latince': 'Latince',
    'Geç Latince': 'Latince'
  };
  return codeMap[lang.trim()] || lang.trim();
};

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
  const { sidebarWords, mapWords, dailyWord, newsItems, isLoading } = useEtymologyData();

  // --- UI STATES ---
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);
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
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const [currentActiveLang, setCurrentActiveLang] = useState('Tüm Diller');
  const [currentActivePeriod, setCurrentActivePeriod] = useState('Tüm Dönemler');
  const [currentLanguageMode, setCurrentLanguageMode] = useState<'origin' | 'immediate'>('origin');
  const [limitPerLang, setLimitPerLang] = useState(5);

  // --- MAP GENERATION LOGIC ---
  const coordinateCache = useRef<Record<string, [number, number]>>({});

  const getPersistentCoordinates = useCallback((wordKey: string, languageData: Language): [number, number] => {
    if (coordinateCache.current[wordKey]) {
      return coordinateCache.current[wordKey];
    }

    const newCoords = getRandomCoordinatesInBoundingBox(languageData);
    coordinateCache.current[wordKey] = newCoords;
    return newCoords;
  }, []);

  const generateMapWords = useCallback((wordsToMap: Word[], limit: number) => {
    if (!allLanguages || allLanguages.length === 0) return [];

    const groupedWords: Record<string, Word[]> = {};
    wordsToMap.forEach(word => {
      const rawLang = currentLanguageMode === 'immediate'
        ? ((word as any).immediateSourceLanguage || (word as any).immediateLanguage || 'Bilinmiyor')
        : ((word as any).ultimateOriginLanguage || word.originLanguage || 'Bilinmiyor');
        
      const langKey = String(rawLang).trim();
      if (!groupedWords[langKey]) groupedWords[langKey] = [];
      groupedWords[langKey].push(word);
    });

    let selectedWords: Word[] = [];
    Object.keys(groupedWords).forEach(lang => {
      const wordsInLang = groupedWords[lang];
      const picked = wordsInLang.slice(0, limit);
      selectedWords = [...selectedWords, ...picked];
    });

    return selectedWords.map((word: Word) => {
      const rawLang = currentLanguageMode === 'immediate'
        ? ((word as any).immediateSourceLanguage || (word as any).immediateLanguage || 'Bilinmiyor')
        : ((word as any).ultimateOriginLanguage || word.originLanguage || 'Bilinmiyor');
        
      const dbLang = mapOriginLanguageToTurkish(String(rawLang));
      const languageData = allLanguages.find((lang: Language) =>
        lang.language.toLocaleLowerCase('tr-TR') === dbLang.toLocaleLowerCase('tr-TR')
      );
      if (!languageData) return null;
      return {
        ...word,
        coordinates: getPersistentCoordinates(`${word.id}-${word.word}`, languageData),
      };
    }).filter((word: WordOnMap | null): word is WordOnMap => word !== null);
  }, [allLanguages, getPersistentCoordinates, currentLanguageMode]);

  // --- INITIAL MAP POPULATION ---
  useEffect(() => {
    if (!isLoading && mapWords.length > 0) {
      const initialSet = generateMapWords(mapWords, 5);
      setWordsOnMap(initialSet);
      setDefaultMapWords(initialSet);
    }
  }, [isLoading, mapWords, sidebarWords, generateMapWords]);

  // --- CENTRAL FILTERING (Map & Time) ---
  const mapSourceList = useMemo(() => {
    return mapWords.filter(word => {
      const matchesPeriod = currentActivePeriod === 'Tüm Dönemler' || word.period === currentActivePeriod;

      let matchesLanguage = true;
      if (currentActiveLang !== 'Tüm Diller') {
        const langStr = currentLanguageMode === 'immediate'
          ? ((word as any).immediateSourceLanguage || (word as any).immediateLanguage || 'Bilinmiyor')
          : ((word as any).ultimateOriginLanguage || word.originLanguage || 'Bilinmiyor');
        matchesLanguage = langStr.trim() === currentActiveLang;
      }
      
      return matchesPeriod && matchesLanguage;
    });
  }, [mapWords, currentActivePeriod, currentActiveLang, currentLanguageMode]);

  useEffect(() => {
    if (mapSourceList.length === 0) {
      setWordsOnMap([]);
      return;
    }

    const timeFilteredList = mapSourceList.filter(word => {
      if (!word.date) return true;
      const wDate = parseInt(String(word.date));
      if (isNaN(wDate)) return true;
      return wDate <= selectedYear;
    });

    if (selectedYear >= 2025 && defaultMapWords.length > 0 && limitPerLang === 5 && mapSourceList.length === mapWords.length) {
      setWordsOnMap(defaultMapWords);
    } else {
      const newMapSet = generateMapWords(timeFilteredList, limitPerLang);
      setWordsOnMap(newMapSet);
    }
  }, [selectedYear, mapSourceList, defaultMapWords, generateMapWords, limitPerLang, mapWords.length]);


  // --- HANDLERS ---

  const handleFilterChange = (searchTerm: string, applyToMap: boolean, activeLang: string, activePeriod: string, languageMode: 'origin' | 'immediate') => {
    setCurrentSearchTerm(searchTerm);
    setCurrentActiveLang(activeLang);
    setCurrentActivePeriod(activePeriod);
    setCurrentLanguageMode(languageMode);
  };

  const handleWordSelect = useCallback((selectedWord: Word) => {
    if (!allLanguages) return;
    const dbLang = mapOriginLanguageToTurkish(selectedWord.originLanguage);
    const languageData = allLanguages.find(lang =>
      lang.language.toLocaleLowerCase('tr-TR') === dbLang.toLocaleLowerCase('tr-TR')
    );

    setDetailPanelWord(selectedWord);
  setIsRightSidebarVisible(true);

    const existingWord = wordsOnMap.find(w => w.id === selectedWord.id);
    if (existingWord) {
      setMapFlyToTarget(existingWord.coordinates);
    } else {
      if (languageData && languageData.boundingBox) {
        const newCoordinates = getPersistentCoordinates(selectedWord.id.toString(), languageData);
        const newWordOnMap: WordOnMap = { ...selectedWord, coordinates: newCoordinates };
        setWordsOnMap(prev => [...prev, newWordOnMap]);
        setMapFlyToTarget(newCoordinates);
      }
    }
  }, [allLanguages, wordsOnMap]);

  const handleMarkerClick = (word: WordOnMap) => {
    setDetailPanelWord(word);
    setIsRightSidebarVisible(true);
  };

  const handleQuickFilter = (type: 'language' | 'period', value: string) => {
    setFilterTrigger({ type, value, timestamp: Date.now() });
    setIsSidebarVisible(true);
  };

  const handleGoHome = useCallback(() => {
    setDetailPanelWord(null);
    setIsRightSidebarVisible(false);
    setMapFlyToTarget(null);
    if (router.query.word) {
      router.replace('/', undefined, { shallow: true });
    }
  }, [router]);

  const handleCloseDetailPanel = useCallback(() => {
    setIsRightSidebarVisible(false);
    setDetailPanelWord(null);
    if (router.query.word) {
      router.replace('/', undefined, { shallow: true });
    }
  }, [router]);

  const toggleSidebar = () => setIsSidebarVisible(prev => !prev);
  const toggleRightSidebar = () => {
    if (!detailPanelWord) return;
    setIsRightSidebarVisible(prev => !prev);
  };
  const toggleAboutPanel = () => setIsAboutPanelVisible(prev => !prev);

  // --- URL SYNC ---
  useEffect(() => {
    if (!router.isReady) return;
    const currentQuery = router.query.word;
    if (detailPanelWord) {
      if (currentQuery !== detailPanelWord.word) {
        router.replace(`/?word=${detailPanelWord.word}`, undefined, { shallow: true });
      }
    }
  }, [detailPanelWord, router.isReady, router.query.word]);

  useEffect(() => {
    if (!router.isReady) return;
    const queryWord = router.query.word;

    let isMounted = true;

    const resolveWordFromQuery = async () => {
      if (!queryWord || typeof queryWord !== 'string') {
        return;
      }

      if (detailPanelWord) {
        return;
      }

      const normalizedQuery = queryWord.toLocaleLowerCase('tr-TR');
      const localMatch = [...sidebarWords, ...mapWords].find(
        (w) => w.word.toLocaleLowerCase('tr-TR') === normalizedQuery
      );

      if (localMatch) {
        if (isMounted) {
          handleWordSelect(localMatch);
          setIsRightSidebarVisible(true);
        }
        return;
      }

      const fetched = await wordService.fetchWordByExact(queryWord);
      if (isMounted && fetched) {
        handleWordSelect(fetched);
        setIsRightSidebarVisible(true);
      }
    };

    resolveWordFromQuery();

    return () => {
      isMounted = false;
    };
  }, [router.isReady, router.query.word, sidebarWords, mapWords, handleWordSelect, detailPanelWord]);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>

      <MetaHead selectedWord={detailPanelWord} />

      <LoadingScreen isLoading={isLoading} />
      <SettingsMenu 
        onAboutClick={toggleAboutPanel} 
        onStatsClick={() => setIsStatsPanelOpen(true)} 
        limitPerLang={limitPerLang} 
        onLimitChange={setLimitPerLang} 
      />

      <AboutPanel isVisible={isAboutPanelVisible} onClose={() => setIsAboutPanelVisible(false)} />
      <ToggleSidebarButton isVisible={isSidebarVisible} onClick={toggleSidebar} />
      {detailPanelWord && (
        <ToggleRightSidebarButton isVisible={isRightSidebarVisible} onClick={toggleRightSidebar} />
      )}

      <LeftSidebar
        allWords={sidebarWords}
        dailyWord={dailyWord}
        onWordSelect={handleWordSelect}
        onHomeClick={handleGoHome}
        isVisible={isSidebarVisible}
        onFilterChange={handleFilterChange}
        externalFilterTrigger={filterTrigger}
      />

      <main style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
        <MapComponent
          wordsOnMap={wordsOnMap}
          mapFlyToTarget={mapFlyToTarget}
          onMarkerClick={handleMarkerClick}
          onMapClick={() => { }}
          selectedWordKey={detailPanelWord ? `${detailPanelWord.id}-${detailPanelWord.word}` : null}
        />
      </main>

      <TimeSlider
        year={selectedYear}
        onChange={setSelectedYear}
        isLeftOpen={isSidebarVisible}
        isRightOpen={detailPanelWord !== null && isRightSidebarVisible}
        disabled={false}
      />

      <NewsTicker newsItems={newsItems} />

      <RightDetailPanel
        word={detailPanelWord}
        isOpen={isRightSidebarVisible}
        onClose={handleCloseDetailPanel}
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