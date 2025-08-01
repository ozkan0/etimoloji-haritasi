import React, { useState, useMemo } from 'react';
import { Word } from '../types';
import ThemeSwitch from '../components/ThemeSwitch';

interface LeftSidebarProps {
  allWords: Word[];
  onWordSelect: (word: Word) => void;
  isVisible: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ allWords, onWordSelect, isVisible }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('Tüm Diller');
  const [periodFilter, setPeriodFilter] = useState<'Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet'>('Tüm Dönemler');
  
  // --- NEW STATE for the filter panel ---
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);

  const dynamicSidebarStyle: React.CSSProperties = {
    ...sidebarStyle,
    transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
  };

  const filteredWords = useMemo(() => {
    return allWords
      .filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLanguage = languageFilter === 'Tüm Diller' || word.originLanguage === languageFilter;
        const matchesPeriod = periodFilter === 'Tüm Dönemler' || word.period === periodFilter;
        return matchesSearch && matchesLanguage && matchesPeriod;
      })
      .sort((a, b) => a.word.localeCompare(b.word, 'tr'));
  }, [allWords, searchTerm, languageFilter, periodFilter]);

  const availableLanguages = useMemo(() => ['Tüm Diller', ...new Set(allWords.map(w => w.originLanguage).sort())], [allWords]);
  const availablePeriods: ('Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet')[] = ['Tüm Dönemler', 'Osmanlı Öncesi', 'Osmanlı', 'Cumhuriyet'];

  
  return (
    <div style={dynamicSidebarStyle} className="sidebar-main">
      {/* --- HEADER SECTION --- */}
      <div style={headerStyle} className="sidebar-header">
        
        <div style={{width: '100%', textAlign: 'center', marginBottom: '15px'}}>
          <ThemeSwitch />
          <h2 style={{margin: 0}}>Etimoloji Haritası</h2>
        </div>
        <input
          type="text"
          placeholder="Kelime ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        <button 
          className="filter-button" 
          onClick={() => setIsFilterPanelVisible(prev => !prev)}
        >
          Filtrele {isFilterPanelVisible ? '▲' : '▼'}
        </button>
        {/* --- FILTER PANEL --- */}
        <div className={`filter-panel ${isFilterPanelVisible ? 'open' : ''}`}>
          <div style={{display: 'flex', gap: '10px', width: '100%'}}>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} style={selectStyle}>
              {availableLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value as any)} style={selectStyle}>
              {availablePeriods.map(period => <option key={period} value={period}>{period}</option>)}
            </select>
          </div>
          <button style={updateButtonStyle}>
            Güncelle
          </button>
        </div>
      </div>

      <ul style={wordListStyle}>
        {filteredWords.map(word => (
          <li 
            key={word.id} 
            onClick={() => onWordSelect(word)} 
            style={wordItemStyle} 
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover-bg)';
              e.currentTarget.style.borderLeft = '4px solid var(--sidebar-header-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderLeft = '4px solid transparent';
            }}
          >
            <strong>{word.word}</strong>
            <small style={wordDetailStyle}>{word.originLanguage} / {word.period}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};


const sidebarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1001,
  transition: 'transform 0.3s ease-in-out',
  boxShadow: '3px 0px 15px rgba(0,0,0,0.1)',
  width: '350px',
  height: '100vh',
  backgroundColor: 'var(--sidebar-main-bg)',
  borderRight: '1px solid var(--sidebar-border-color)',
  color: 'var(--sidebar-text-primary)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'sans-serif',
};

const updateButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#0094ff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '10px',
};


const headerStyle: React.CSSProperties = {
  padding: '15px 20px',
  backgroundColor: 'var(--sidebar-header-bg)',
  color: 'white',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginBottom: '10px',
};
const filterContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px'
};
const selectStyle: React.CSSProperties = {
  width: '50%',
  padding: '12px'
};
const wordListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: '10px',
  overflowY: 'auto',
  flex: 1,
  transition: 'background-color 0.3s ease'
};
const wordItemStyle: React.CSSProperties = {
  padding: '12px 5px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  transition: 'background-color 0.2s ease, border-left 0.2s ease',
  borderRadius: '8px',
  marginBottom: '5px',
  borderLeft: '4px solid transparent', 
};
const wordDetailStyle: React.CSSProperties = {
  color: 'var(--sidebar-text-secondary)',
  marginTop: '4px',
  fontSize: '0.85rem',
};

export default LeftSidebar;