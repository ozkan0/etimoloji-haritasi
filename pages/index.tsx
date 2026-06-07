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
import RefreshMarkersButton from '../components/ui/RefreshMarkersButton';
import LoadingScreen from '../components/ui/LoadingScreen';
import MetaHead from '../components/ui/MetaHead';

// Features
import NewsTicker from '../components/features/news/NewsTicker';
import TimeSlider from '../components/features/timeline/TimeSlider';

// Logic / Types
import { Word, Language, WordOnMap } from '../types/types';
import { getPersistentCoordinates as getGeoCoordinates } from '../utils/geoUtils';
import { useEtymologyData } from '../hooks/useEtymologyData';
import { wordService } from '../services/wordService';
import { mapOriginLanguageToTurkish } from '../config/languageMapping';

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
  const { sidebarWords, mapWords, dailyWord, newsItems, isLoading, isRefreshing, refreshMapWords } = useEtymologyData();

  // --- UI STATES ---
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);
  const [isAboutPanelVisible, setIsAboutPanelVisible] = useState(false);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  const [lastOpenedPanel, setLastOpenedPanel] = useState<'left' | 'right' | null>(null);

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
  const getPersistentCoordinates = useCallback((wordKey: string, languageData: Language): [number, number] => {
    let seed = 0;
    for (let i = 0; i < wordKey.length; i++) {
      seed = ((seed << 5) - seed) + wordKey.charCodeAt(i);
      seed |= 0; 
    }
    return getGeoCoordinates(languageData, Math.abs(seed));
  }, []);

  const generateMapWords = useCallback((wordsToMap: Word[], limit: number) => {
    if (!allLanguages || allLanguages.length === 0) return [];

    const groupedWords: Record<string, Word[]> = {};
    wordsToMap.forEach(word => {
      const rawLang = currentLanguageMode === 'immediate'
        ? (word.immediateSourceLanguage || 'Bilinmiyor')
        : (word.ultimateOriginLanguage || word.originLanguage || 'Bilinmiyor');
        
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
        ? (word.immediateSourceLanguage || 'Bilinmiyor')
        : (word.ultimateOriginLanguage || word.originLanguage || 'Bilinmiyor');
        
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
      setDefaultMapWords(initialSet);
      setWordsOnMap(prev => {
        const base = [...initialSet];
        if (detailPanelWord) {
          const onMap = prev.find(w => w.id === detailPanelWord.id);
          if (onMap && !base.find(w => w.id === detailPanelWord.id)) {
            base.push(onMap);
          }
        }
        return base;
      });
    }
  }, [isLoading, mapWords, generateMapWords, detailPanelWord]);

  // --- CENTRAL FILTERING (Map & Time) ---
  const mapSourceList = useMemo(() => {
    return mapWords.filter(word => {
      const matchesPeriod = currentActivePeriod === 'Tüm Dönemler' || word.period === currentActivePeriod;

      let matchesLanguage = true;
      if (currentActiveLang !== 'Tüm Diller') {
        const langStr = currentLanguageMode === 'immediate'
          ? (word.immediateSourceLanguage || 'Bilinmiyor')
          : (word.ultimateOriginLanguage || word.originLanguage || 'Bilinmiyor');
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

    const ensureSelectedWordOnMap = (currentMapWords: WordOnMap[]): WordOnMap[] => {
      if (!detailPanelWord || !allLanguages) return currentMapWords;
      if (currentMapWords.find(w => w.id === detailPanelWord.id)) return currentMapWords;

      const dbLang = mapOriginLanguageToTurkish(detailPanelWord.originLanguage);
      const languageData = allLanguages.find(lang =>
        lang.language.toLocaleLowerCase('tr-TR') === dbLang.toLocaleLowerCase('tr-TR')
      );

      if (languageData && languageData.boundingBox) {
        const coords = getPersistentCoordinates(`${detailPanelWord.id}-${detailPanelWord.word}`, languageData);
        return [...currentMapWords, { ...detailPanelWord, coordinates: coords }];
      }
      return currentMapWords;
    };

    if (selectedYear >= 2025 && defaultMapWords.length > 0 && limitPerLang === 5 && mapSourceList.length === mapWords.length) {
      setWordsOnMap(ensureSelectedWordOnMap([...defaultMapWords]));
    } else {
      const newMapSet = generateMapWords(timeFilteredList, limitPerLang);
      setWordsOnMap(ensureSelectedWordOnMap(newMapSet));
    }
  }, [selectedYear, mapSourceList, defaultMapWords, generateMapWords, limitPerLang, mapWords.length, detailPanelWord, allLanguages, getPersistentCoordinates]);


  // --- HANDLERS ---

  const handleFilterChange = useCallback((searchTerm: string, applyToMap: boolean, activeLang: string, activePeriod: string, languageMode: 'origin' | 'immediate') => {
    setCurrentSearchTerm(searchTerm);
    setCurrentActiveLang(activeLang);
    setCurrentActivePeriod(activePeriod);
    setCurrentLanguageMode(languageMode);
  }, []);

  const handleWordSelect = useCallback((selectedWord: Word) => {
    if (!allLanguages) return;
    const dbLang = mapOriginLanguageToTurkish(selectedWord.originLanguage);
    const languageData = allLanguages.find(lang =>
      lang.language.toLocaleLowerCase('tr-TR') === dbLang.toLocaleLowerCase('tr-TR')
    );

    setDetailPanelWord(selectedWord);
    setIsRightSidebarVisible(true);
    setLastOpenedPanel('right');

    const existingWord = wordsOnMap.find(w => w.id === selectedWord.id);
    if (existingWord) {
      setMapFlyToTarget(existingWord.coordinates);
    } else {
      if (languageData && languageData.boundingBox) {
        const newCoordinates = getPersistentCoordinates(`${selectedWord.id}-${selectedWord.word}`, languageData);
        const newWordOnMap: WordOnMap = { ...selectedWord, coordinates: newCoordinates };
        setWordsOnMap(prev => [...prev, newWordOnMap]);
        setMapFlyToTarget(newCoordinates);
      }
    }
  }, [allLanguages, wordsOnMap, getPersistentCoordinates]);

  const handleMarkerClick = useCallback((word: WordOnMap) => {
    setDetailPanelWord(word);
    setIsRightSidebarVisible(true);
    setLastOpenedPanel('right');
  }, []);

  const handleQuickFilter = useCallback((type: 'language' | 'period', value: string) => {
    setFilterTrigger({ type, value, timestamp: Date.now() });
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    if (!isMobile) {
      setIsSidebarVisible(true);
      setLastOpenedPanel('left');
    }
  }, []);

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

  const toggleSidebar = () => {
    const next = !isSidebarVisible;
    setIsSidebarVisible(next);
    if (next) setLastOpenedPanel('left');
  };
  const toggleRightSidebar = () => {
    if (!detailPanelWord) return;
    const next = !isRightSidebarVisible;
    setIsRightSidebarVisible(next);
    if (next) setLastOpenedPanel('right');
  };
  const toggleAboutPanel = () => setIsAboutPanelVisible(prev => !prev);

  const handleBackdropClick = () => {
    if (isSidebarVisible && isRightSidebarVisible) {
      if (lastOpenedPanel === 'left') setIsSidebarVisible(false);
      else setIsRightSidebarVisible(false);
    } else if (isRightSidebarVisible) {
      setIsRightSidebarVisible(false);
    } else if (isSidebarVisible) {
      setIsSidebarVisible(false);
    }
  };

  const leftSidebarZ = lastOpenedPanel === 'left' ? 1003 : 1002;
  const rightPanelZ = lastOpenedPanel === 'left' ? 1002 : 1003;

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
      <RefreshMarkersButton onClick={refreshMapWords} isRefreshing={isRefreshing} />

      <AboutPanel isVisible={isAboutPanelVisible} onClose={() => setIsAboutPanelVisible(false)} />

      {(isSidebarVisible || (detailPanelWord && isRightSidebarVisible)) && (
        <div className="mobile-backdrop" onClick={handleBackdropClick} aria-hidden="true" />
      )}

      <ToggleSidebarButton isVisible={isSidebarVisible} onClick={toggleSidebar} zIndex={leftSidebarZ} />
      {detailPanelWord && (
        <ToggleRightSidebarButton isVisible={isRightSidebarVisible} onClick={toggleRightSidebar} zIndex={rightPanelZ} />
      )}

      <LeftSidebar
        allWords={sidebarWords}
        dailyWord={dailyWord}
        onWordSelect={handleWordSelect}
        onHomeClick={handleGoHome}
        isVisible={isSidebarVisible}
        onFilterChange={handleFilterChange}
        externalFilterTrigger={filterTrigger}
        zIndex={leftSidebarZ}
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
        zIndex={rightPanelZ}
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