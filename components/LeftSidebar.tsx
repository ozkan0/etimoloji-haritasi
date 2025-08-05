import React, { useState, useMemo } from 'react';
import { Word } from '../types/types';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitch from './ThemeSwitch';

interface LeftSidebarProps {
  allWords: Word[];
  onWordSelect: (word: Word) => void;
  isVisible: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ allWords, onWordSelect, isVisible }) => {
  
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeLanguageFilter, setActiveLanguageFilter] = useState('Tüm Diller');
  const [activePeriodFilter, setActivePeriodFilter] = useState<'Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet'>('Tüm Dönemler');

  const [stagedSearchTerm, setStagedSearchTerm] = useState('');
  const [stagedLanguageFilter, setStagedLanguageFilter] = useState('Tüm Diller');
  const [stagedPeriodFilter, setStagedPeriodFilter] = useState<'Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet'>('Tüm Dönemler');

  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);

  const dynamicSidebarStyle: React.CSSProperties = {
    ...sidebarStyle,
    transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
  };

  const filteredWords = useMemo(() => {
    return allWords
      .filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(activeSearchTerm.toLowerCase());
        const matchesLanguage = activeLanguageFilter === 'Tüm Diller' || word.originLanguage === activeLanguageFilter;
        const matchesPeriod = activePeriodFilter === 'Tüm Dönemler' || word.period === activePeriodFilter;
        return matchesSearch && matchesLanguage && matchesPeriod;
      })
      .sort((a, b) => a.word.localeCompare(b.word, 'tr'));
  }, [allWords, activeSearchTerm, activeLanguageFilter, activePeriodFilter]);

  const availableLanguages = useMemo(() => ['Tüm Diller', ...new Set(allWords.map(w => w.originLanguage).sort())], [allWords]);
  const availablePeriods: ('Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet')[] = ['Tüm Dönemler', 'Osmanlı Öncesi', 'Osmanlı', 'Cumhuriyet'];

  const handleUpdateClick = () => {
    setActiveSearchTerm(stagedSearchTerm);
    setActiveLanguageFilter(stagedLanguageFilter);
    setActivePeriodFilter(stagedPeriodFilter);
  };
  
  return (
    <div style={dynamicSidebarStyle} className="sidebar-main">
      {/* --- HEADER SECTION --- */}
      <div style={headerStyle} className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
          <ThemeSwitch />
          <div style={{flex: 1, textAlign: 'center'}}>
            <h2 style={{margin: 0, marginLeft:20, display: 'inline-block'}}>Etimoloji Haritası</h2>
          </div>
          <div style={{width: '40px'}} /> 
        </div>

        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="Kelime ara..."
            value={stagedSearchTerm}
            onChange={(e) => setStagedSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
          
          {stagedSearchTerm && (
            <button onClick={() => setStagedSearchTerm('')} style={clearButtonStyle}>
              ×
            </button>
          )}

          <button style={searchButtonStyle} onClick={handleUpdateClick}> {/* <-- ADD onClick HANDLER HERE */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
        </div>
        
        <button 
          className="filter-button" 
          onClick={() => setIsFilterPanelVisible(prev => !prev)}
        >
          Filtrele {isFilterPanelVisible ? '▲' : '▼'}
        </button>
        {/* --- FILTER PANEL --- */}
        <div className={`filter-panel ${isFilterPanelVisible ? 'open' : ''}`}>
          <div style={{display: 'flex', gap: '10px', width: '100%'}}>

          <select value={stagedLanguageFilter} onChange={(e) => setStagedLanguageFilter(e.target.value)} style={selectStyle}>
            {availableLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
          <select value={stagedPeriodFilter} onChange={(e) => setStagedPeriodFilter(e.target.value as any)} style={selectStyle}>
            {availablePeriods.map(period => <option key={period} value={period}>{period}</option>)}
          </select>
        </div>
        <button style={updateButtonStyle} onClick={handleUpdateClick}>
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
  boxShadow: '0 4px 25px rgba(0, 0, 0, 0.1)',
  width: '350px',
  height: '100vh',
  backgroundColor: 'var(--sidebar-main-bg)',
  borderRight: '1px solid var(--sidebar-border-color)',
  color: 'var(--sidebar-text-primary)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'sans-serif',
  borderTopRightRadius: '12px',
  borderBottomRightRadius: '12px',
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
  borderTopRightRadius: '12px',
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  width: '100%',
  marginBottom: '10px',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  paddingRight: '70px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const clearButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '50px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#999',
  padding: '0 5px',
};

const searchButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '0px',
  top: '0px',
  height: '100%',
  width: '50px',
  background: '#e9ecef',
  border: '1px solid #ccc',
  borderTopRightRadius: '4px',
  borderBottomRightRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666',
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
  transition: 'background-color 0.2s ease',
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