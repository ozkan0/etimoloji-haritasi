import React, { useState, useMemo, useEffect } from 'react';
import { Word } from '../types/types';
import AiOriginDisplay from './AiOriginDisplay';

interface LeftSidebarProps {
  allWords: Word[];
  onWordSelect: (word: Word) => void;
  isVisible: boolean;
  onFilterChange: (filteredWords: Word[], applyToMap: boolean, activeLang: string, activePeriod: string) => void;
  externalFilterTrigger?: { type: 'language' | 'period', value: string, timestamp: number } | null;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ allWords, onWordSelect, isVisible, onFilterChange, externalFilterTrigger }) => {
  
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');
  
  const [activeLanguageFilter, setActiveLanguageFilter] = useState('Tüm Diller');
  const [activePeriodFilter, setActivePeriodFilter] = useState<'Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet'>('Tüm Dönemler');
  
  const [applyToMap, setApplyToMap] = useState(false);
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);

  const [aiOrigin, setAiOrigin] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSearchedWord, setAiSearchedWord] = useState('');
  const [hasAiSearched, setHasAiSearched] = useState(false);

  const [wordOfTheDay, setWordOfTheDay] = useState<Word | null>(null);

  useEffect(() => {
    if (allWords.length > 0) {
      const today = new Date();
      const seed = today.getDate() + (today.getMonth() + 1) * 100 + today.getFullYear() * 10000;
      const index = seed % allWords.length;
      setWordOfTheDay(allWords[index]);
    }
  }, [allWords]);

  useEffect(() => {
    if (externalFilterTrigger) {
        setIsFilterPanelVisible(true);
        if (externalFilterTrigger.type === 'language') {
            setActiveLanguageFilter(externalFilterTrigger.value);
        } else if (externalFilterTrigger.type === 'period') {
            setActivePeriodFilter(externalFilterTrigger.value as any);
        }
        setApplyToMap(true);
    }
  }, [externalFilterTrigger]);

  const filteredWordsForList = useMemo(() => {
    return allWords
      .filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(activeSearchTerm.toLowerCase());
        const matchesLanguage = activeLanguageFilter === 'Tüm Diller' || word.originLanguage === activeLanguageFilter;
        const matchesPeriod = activePeriodFilter === 'Tüm Dönemler' || word.period === activePeriodFilter;
        return matchesSearch && matchesLanguage && matchesPeriod;
      })
      .sort((a, b) => a.word.localeCompare(b.word, 'tr'));
  }, [allWords, activeSearchTerm, activeLanguageFilter, activePeriodFilter]);

  const filteredWordsForMap = useMemo(() => {
    return allWords
      .filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(committedSearchTerm.toLowerCase());
        const matchesLanguage = activeLanguageFilter === 'Tüm Diller' || word.originLanguage === activeLanguageFilter;
        const matchesPeriod = activePeriodFilter === 'Tüm Dönemler' || word.period === activePeriodFilter;
        return matchesSearch && matchesLanguage && matchesPeriod;
      });
  }, [allWords, committedSearchTerm, activeLanguageFilter, activePeriodFilter]);

  useEffect(() => {
    onFilterChange(filteredWordsForMap, applyToMap, activeLanguageFilter, activePeriodFilter);
  }, [filteredWordsForMap, applyToMap, activeLanguageFilter, activePeriodFilter]); 

  const availableLanguages = useMemo(() => {
    const coreLanguages = [
      'Türkçe', 'Arapça', 'Fransızca', 'Farsça', 'İtalyanca', 
      'Almanca', 'İspanyolca', 'İngilizce', 'Latince', 'Yunanca'
    ];
    const dynamicLangs = allWords.map(w => w.originLanguage);
    const uniqueLangs = [...new Set([...coreLanguages, ...dynamicLangs])];
    uniqueLangs.sort((a, b) => a.localeCompare(b, 'tr'));
    return ['Tüm Diller', ...uniqueLangs];
  }, [allWords]);

  const prepareAiRequest = (term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm === '') {
        setHasAiSearched(false);
        setAiOrigin(null);
        return;
    }
    setHasAiSearched(true);
    setAiOrigin(null);
    setAiSearchedWord(trimmedTerm);
  };

  const executeAiFetch = async () => {
    if (!aiSearchedWord || aiSearchedWord.length < 2) return;
    setIsAiLoading(true);
    setAiOrigin(null);
    try {
      const response = await fetch(`/api/get-ai-origin?word=${encodeURIComponent(aiSearchedWord)}`);
      const data = await response.json();
      data.origin ? setAiOrigin(data.origin) : setAiOrigin("Bilinmiyor");
    } catch (err) {
      console.error("AI Fetch Error", err);
      setAiOrigin("Hata oluştu");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearchChange = (val: string) => { setActiveSearchTerm(val); };
  const handleSearchSubmit = () => { setCommittedSearchTerm(activeSearchTerm); prepareAiRequest(activeSearchTerm); };
  const handleClearSearch = () => { setActiveSearchTerm(''); setCommittedSearchTerm(''); };

  const handleResetFilters = () => {
    setActiveSearchTerm('');
    setCommittedSearchTerm('');
    setActiveLanguageFilter('Tüm Diller');
    setActivePeriodFilter('Tüm Dönemler');
    setApplyToMap(false);
    setAiOrigin(null);
    setHasAiSearched(false);
    setAiSearchedWord('');
  };
  
  // --- STYLES ---
  const dynamicSidebarStyle: React.CSSProperties = { position: 'absolute', height: '100vh', zIndex: 1001, transition: 'transform 0.3s ease-in-out', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.1)', width: '350px', backgroundColor: 'var(--sidebar-main-bg)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-primary)', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', borderRadius: '22px', overflow: 'hidden', transform: isVisible ? 'translateX(0)' : 'translateX(-100%)', };
  const headerStyle: React.CSSProperties = { padding: '15px 20px', backgroundColor: 'var(--sidebar-header-bg)', color: 'white' };
  const segmentContainerStyle: React.CSSProperties = { display: 'flex', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px', gap: '4px', marginTop: '0px' };

  const getSegmentStyle = (periodName: string, isActive: boolean): React.CSSProperties => {
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';

    if (isActive) {
        switch (periodName) {
            case 'Osmanlı Öncesi': backgroundColor = '#D97706'; borderColor = '#B45309'; break;
            case 'Osmanlı': backgroundColor = '#166534'; borderColor = '#14532D'; break;
            case 'Cumhuriyet': backgroundColor = '#B91C1C'; borderColor = '#991B1B'; break;
            default: backgroundColor = 'var(--detailspanel-header-bg)';
        }
    }

    return {
        flex: 1, padding: '6px 2px', fontSize: '0.75rem', textAlign: 'center', cursor: 'pointer', borderRadius: '6px',
        backgroundColor: backgroundColor, border: isActive ? `1px solid ${borderColor}` : '1px solid transparent',
        color: isActive ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: isActive ? 700 : 500, 
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', userSelect: 'none', whiteSpace: 'normal', lineHeight: '1.2', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px', boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
    };
  };

  const searchContainerStyle: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%', marginBottom: '5px', marginTop: '5px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '2px 5px' };
  const searchInputStyle: React.CSSProperties = { flex: 1, border: 'none', background: 'transparent', padding: '10px 15px', color: 'white', fontSize: '0.95rem', outline: 'none' };
  const clearButtonStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)', padding: '0 8px' };
  const searchButtonStyle: React.CSSProperties = { background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' };
  const wordListStyle: React.CSSProperties = { listStyle: 'none', margin: 0, padding: '10px', overflowY: 'auto', flex: 1, paddingBottom: '90px' };
  const wordItemStyle: React.CSSProperties = { padding: '12px 5px', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'background-color 0.2s ease, border-left 0.2s ease', borderRadius: '8px', marginBottom: '5px', borderLeft: '4px solid transparent' };
  const wordDetailStyle: React.CSSProperties = { color: 'var(--sidebar-text-secondary)', marginTop: '4px', fontSize: '0.85rem' };
  const footerStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: 'var(--sidebar-header-bg)', color: 'white', padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 10, boxShadow: '0 -4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' };
  const resetButtonStyle: React.CSSProperties = { padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid rgba(255, 100, 100, 0.5)', color: '#ffcccc', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' };

  return (
    <div style={dynamicSidebarStyle} className="sidebar-main">
      <div style={headerStyle} className="sidebar-header">
        <style jsx>{` .modern-input::placeholder { color: white; opacity: 0.6; } `}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
          <div style={{flex: 1, textAlign: 'center'}}>
            <h2 style={{margin: 0, marginLeft:20, display: 'inline-block'}}>Etimoloji Haritası</h2>
          </div>
          <div style={{width: '40px'}} /> 
        </div>

        <AiOriginDisplay origin={aiOrigin} loading={isAiLoading} searchedWord={aiSearchedWord} hasSearched={hasAiSearched} onStart={executeAiFetch} />

        <div style={searchContainerStyle}>
          <input className="modern-input" type="text" placeholder="Kelime ara..." value={activeSearchTerm} onChange={(e) => handleSearchChange(e.target.value)} style={searchInputStyle} onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()} />
          {activeSearchTerm && <button onClick={handleClearSearch} style={clearButtonStyle}>×</button>}
          <button style={searchButtonStyle} onClick={handleSearchSubmit}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
        
        <button className="filter-button-modern" onClick={() => setIsFilterPanelVisible(prev => !prev)}>Filtrele <span>{isFilterPanelVisible ? '▲' : '▼'}</span></button>

        <div className={`filter-panel-modern ${isFilterPanelVisible ? 'open' : ''}`}>
          <select value={activeLanguageFilter} onChange={(e) => setActiveLanguageFilter(e.target.value)} className="modern-select">
              {availableLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>

          <div style={segmentContainerStyle}>
             <div style={getSegmentStyle('Osmanlı Öncesi', activePeriodFilter === 'Osmanlı Öncesi')} onClick={() => setActivePeriodFilter('Osmanlı Öncesi')}>Osmanlı Öncesi</div>
             <div style={getSegmentStyle('Osmanlı', activePeriodFilter === 'Osmanlı')} onClick={() => setActivePeriodFilter('Osmanlı')}>Osmanlı</div>
             <div style={getSegmentStyle('Cumhuriyet', activePeriodFilter === 'Cumhuriyet')} onClick={() => setActivePeriodFilter('Cumhuriyet')}>Cumhuriyet</div>
          </div>

          <div style={{display:'flex', alignItems:'center', justifyContent: 'space-between', marginTop:'15px'}}>
             <label style={{display:'flex', alignItems:'center', gap:'8px', cursor: 'pointer', padding:'0 5px'}}>
                <input type="checkbox" checked={applyToMap} onChange={(e) => setApplyToMap(e.target.checked)} style={{cursor:'pointer', width:'16px', height:'16px', accentColor: 'var(--detailspanel-header-bg)', margin: 0}} />
                <span style={{color:'white', fontSize:'0.85rem', userSelect:'none', whiteSpace:'nowrap'}}>Haritayı Filtrele</span>
             </label>
             <button style={resetButtonStyle} onClick={handleResetFilters} title="Tüm filtreleri sıfırla"><span>🗑️</span> Temizle</button>
          </div>
        </div>
      </div>

      <ul style={wordListStyle}>
        {filteredWordsForList.map(word => (
          <li key={word.id} onClick={() => { onWordSelect(word); prepareAiRequest(word.word); }} style={wordItemStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover-bg)'; e.currentTarget.style.borderLeft = '4px solid var(--sidebar-header-bg)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderLeft = '4px solid transparent'; }}>
            <strong>{word.word}</strong>
            <small style={wordDetailStyle}>{word.originLanguage} / {word.period}</small>
          </li>
        ))}
      </ul>
      {wordOfTheDay && (
        <div style={footerStyle} onClick={() => { onWordSelect(wordOfTheDay); prepareAiRequest(wordOfTheDay.word); }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>✨ Günün Kelimesi</div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div><span style={{fontSize: '1.2rem', fontWeight: 800}}>{wordOfTheDay.word}</span></div>
                <div style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '6px' }}>{wordOfTheDay.originLanguage}</div>
            </div>
            <div style={{fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Detayları görmek için tıklayın...</div>
        </div>
      )}
    </div>
  );
};
export default LeftSidebar;