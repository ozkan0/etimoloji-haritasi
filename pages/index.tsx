import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import dynamic from 'next/dynamic';
import LeftSidebar from '../components/LeftSidebar';
import RightDetailPanel from '../components/RightDetailPanel';
import CustomPopup, { PopupData } from '../components/CustomPopup';
import { Word, Language, WordOnMap } from '../types';

const MapComponent = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <p style={{ flex: 1, textAlign: 'center', alignSelf: 'center' }}>Harita Yükleniyor...</p>,
});

interface ToggleSidebarButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({ isVisible, onClick }) => {
  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: isVisible ? '350px' : '0px', 
    transform: 'translateY(-50%)',
    zIndex: 1100,
    height: '70px',
    width: '25px',
    backgroundColor: '#00695c',
    color: 'white',
    border: 'none',
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '8px',
    borderLeft: '1px solid #004d40',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    transition: 'left 0.3s ease-in-out',
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      {isVisible ? '‹' : '›'}
    </button>
  );
};


interface HomeProps {
  allWords: Word[];
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

const Home: NextPage<HomeProps> = ({ allWords, allLanguages }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [wordsOnMap, setWordsOnMap] = useState<WordOnMap[]>([]);
  const [detailPanelWord, setDetailPanelWord] = useState<Word | null>(null);
  const [mapFlyToTarget, setMapFlyToTarget] = useState<[number, number] | null>(null);
  const [activePopupData, setActivePopupData] = useState<PopupData | null>(null);

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
    // This function updates only the position part of the popup data,
    // keeping the word and latlng the same.
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
        allWords={allWords} 
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
      <ToggleSidebarButton isVisible={isSidebarVisible} onClick={toggleSidebar} />

      <LeftSidebar 
        allWords={allWords} 
        onWordSelect={handleWordSelect} 
        isVisible={isSidebarVisible} 
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