import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Word } from '../types/types';

interface LeftSidebarProps {
  allWords: Word[];
  onWordSelect: (word: Word) => void;
  isVisible: boolean;
  onFilterChange: (filteredWords: Word[], applyToMap: boolean, activeLang: string, activePeriod: string, limitPerLanguage: number) => void;
  externalFilterTrigger?: { type: 'language' | 'period', value: string, timestamp: number } | null;
}

// --- CUSTOM DROPDOWN ---
interface DropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

const CustomDropdown: React.FC<DropdownProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: '10px',
          border: isOpen ? '1px solid var(--detailspanel-header-bg)' : '1px solid var(--sidebar-border-color)',
          backgroundColor: 'var(--sidebar-item-hover-bg)', color: 'var(--sidebar-text-primary)',
          fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'all 0.2s ease', boxShadow: isOpen ? '0 0 0 2px rgba(14, 165, 233, 0.2)' : 'none'
        }}
      >
        <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{value}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
      </div>
      {isOpen && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, width: '100%', maxHeight: '250px', overflowY: 'auto',
          backgroundColor: 'var(--sidebar-main-bg)', border: '1px solid var(--sidebar-border-color)',
          borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 1005, padding: '5px'
        }} className="custom-dropdown-menu">
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className="dropdown-item"
              style={{
                padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer',
                color: opt === value ? 'white' : 'var(--sidebar-text-primary)',
                backgroundColor: opt === value ? 'var(--detailspanel-header-bg)' : 'transparent',
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      <style jsx global>{`
        .custom-dropdown-menu::-webkit-scrollbar { width: 6px; }
        .custom-dropdown-menu::-webkit-scrollbar-thumb { background: rgba(150,150,150,0.3); border-radius: 3px; }
        .dropdown-item:hover { background-color: var(--sidebar-item-hover-bg); }
        .dropdown-item[style*="background-color: var(--detailspanel-header-bg)"]:hover {
           background-color: var(--detailspanel-header-bg) !important; opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ allWords, onWordSelect, isVisible, onFilterChange, externalFilterTrigger }) => {
  
  // --- STATE ---
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  const [activeLanguageFilter, setActiveLanguageFilter] = useState('Tüm Diller');
  const [activePeriodFilter, setActivePeriodFilter] = useState<'Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet'>('Tüm Dönemler');
  
  const [applyToMap, setApplyToMap] = useState(false);
  
  const [limitPerLanguage, setLimitPerLanguage] = useState(5);

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
        const matchesSearch = word.word.toLowerCase().includes(activeSearchTerm.toLowerCase());
        const matchesLanguage = activeLanguageFilter === 'Tüm Diller' || word.originLanguage === activeLanguageFilter;
        const matchesPeriod = activePeriodFilter === 'Tüm Dönemler' || word.period === activePeriodFilter;
        return matchesSearch && matchesLanguage && matchesPeriod;
      });
  }, [allWords, activeSearchTerm, activeLanguageFilter, activePeriodFilter]);

  useEffect(() => {
    onFilterChange(filteredWordsForMap, applyToMap, activeLanguageFilter, activePeriodFilter, limitPerLanguage);
  }, [filteredWordsForMap, applyToMap, activeLanguageFilter, activePeriodFilter, limitPerLanguage]); 

  const availableLanguages = useMemo(() => {
    const coreLanguages = ['Türkçe', 'Arapça', 'Fransızca', 'Farsça', 'İtalyanca', 'Almanca', 'İspanyolca', 'İngilizce', 'Latince', 'Yunanca'];
    const dynamicLangs = allWords.map(w => w.originLanguage);
    const uniqueLangs = [...new Set([...coreLanguages, ...dynamicLangs])];
    uniqueLangs.sort((a, b) => a.localeCompare(b, 'tr'));
    return ['Tüm Diller', ...uniqueLangs];
  }, [allWords]);

  const handleSearchChange = (val: string) => { setActiveSearchTerm(val); };
  const handleClearSearch = () => { setActiveSearchTerm(''); };

  const handleResetFilters = () => {
    setActiveSearchTerm('');
    setActiveLanguageFilter('Tüm Diller');
    setActivePeriodFilter('Tüm Dönemler');
    setApplyToMap(false);
  };
  
  // --- STYLES ---
  const dynamicSidebarStyle: React.CSSProperties = { position: 'absolute', height: '100vh', zIndex: 1001, transition: 'transform 0.3s ease-in-out', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.1)', width: '350px', backgroundColor: 'var(--sidebar-main-bg)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-primary)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-lora), serif', borderRadius: '22px', overflow: 'visible', transform: isVisible ? 'translateX(0)' : 'translateX(-100%)', };
  const headerStyle: React.CSSProperties = { padding: '20px 20px 15px 20px', backgroundColor: 'var(--sidebar-header-bg)', color: 'white' };
  
  const searchContainerStyle: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%', marginBottom: '15px', marginTop: '10px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '4px 10px' };
  const searchInputStyle: React.CSSProperties = { flex: 1, border: 'none', background: 'transparent', padding: '10px 5px', color: 'white', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' };
  const clearButtonStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)', padding: '0 5px' };
  
  const wordListStyle: React.CSSProperties = { listStyle: 'none', margin: 0, padding: '10px', overflowY: 'auto', flex: 1, paddingBottom: '90px' };
  const wordItemStyle: React.CSSProperties = { padding: '12px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', borderRadius: '10px', marginBottom: '4px', borderLeft: '4px solid transparent' };
  const wordDetailStyle: React.CSSProperties = { color: 'var(--sidebar-text-secondary)', marginTop: '4px', fontSize: '0.8rem', opacity: 0.8 };
  const footerStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: 'var(--sidebar-header-bg)', color: 'white', padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 10, boxShadow: '0 -4px 15px rgba(0,0,0,0.15)', cursor: 'pointer', borderBottomLeftRadius: '22px', borderBottomRightRadius: '22px' };
  const resetButtonStyle: React.CSSProperties = { padding: '8px 16px', backgroundColor: 'rgba(255, 99, 71, 0.15)', border: '1px solid rgba(255, 99, 71, 0.4)', color: '#ffcccc', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', fontFamily: 'inherit' };
  const sliderLabelStyle: React.CSSProperties = { fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const rangeInputStyle: React.CSSProperties = { width: '100%', cursor: 'pointer', accentColor: 'var(--detailspanel-header-bg)' };

  const segmentContainerStyle: React.CSSProperties = { display: 'flex', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px', gap: '4px', marginTop: '10px' };
  const getSegmentStyle = (periodName: string, isActive: boolean): React.CSSProperties => {
    let backgroundColor = 'transparent'; let borderColor = 'transparent';
    if (isActive) {
        switch (periodName) {
            case 'Osmanlı Öncesi': backgroundColor = '#D97706'; borderColor = '#B45309'; break; 
            case 'Osmanlı': backgroundColor = '#166534'; borderColor = '#14532D'; break; 
            case 'Cumhuriyet': backgroundColor = '#B91C1C'; borderColor = '#991B1B'; break; 
            default: backgroundColor = 'var(--detailspanel-header-bg)';
        }
    }
    return {
        flex: 1, padding: '8px 2px', fontSize: '0.75rem', textAlign: 'center', cursor: 'pointer', borderRadius: '6px',
        backgroundColor: backgroundColor, border: isActive ? `1px solid ${borderColor}` : '1px solid transparent',
        color: isActive ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: isActive ? 700 : 500, transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
        userSelect: 'none', whiteSpace: 'normal', lineHeight: '1.2', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px', boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
    };
  };

  return (
    <div style={dynamicSidebarStyle} className="sidebar-main">
      <div style={headerStyle} className="sidebar-header">
        <style jsx>{` .modern-input::placeholder { color: white; opacity: 0.6; } `}</style>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px' }}>
          <h2 style={{margin: 0, fontSize: '1.4rem', fontWeight: 800}}>Etimoloji Haritası</h2>
        </div>

        <div style={searchContainerStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.7}}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input className="modern-input" type="text" placeholder="Kelime ara..." value={activeSearchTerm} onChange={(e) => handleSearchChange(e.target.value)} style={searchInputStyle} />
          {activeSearchTerm && <button onClick={handleClearSearch} style={clearButtonStyle}>×</button>}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <CustomDropdown options={availableLanguages} value={activeLanguageFilter} onChange={setActiveLanguageFilter} />

          <div style={segmentContainerStyle}>
             <div style={getSegmentStyle('Osmanlı Öncesi', activePeriodFilter === 'Osmanlı Öncesi')} onClick={() => setActivePeriodFilter('Osmanlı Öncesi')}>Osmanlı Öncesi</div>
             <div style={getSegmentStyle('Osmanlı', activePeriodFilter === 'Osmanlı')} onClick={() => setActivePeriodFilter('Osmanlı')}>Osmanlı</div>
             <div style={getSegmentStyle('Cumhuriyet', activePeriodFilter === 'Cumhuriyet')} onClick={() => setActivePeriodFilter('Cumhuriyet')}>Cumhuriyet</div>
          </div>

          <div style={{marginTop: '15px', padding: '0 4px'}}>
             <div style={sliderLabelStyle}>
                 <span>Haritada Dil Başına Kelime</span>
                 <span style={{backgroundColor: 'rgba(255,255,255,0.2)', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem'}}>{limitPerLanguage}</span>
             </div>
             <input type="range" min="5" max="30" step="1" value={limitPerLanguage} onChange={(e) => setLimitPerLanguage(parseInt(e.target.value))} style={rangeInputStyle} />
          </div>

          <div style={{display:'flex', alignItems:'center', justifyContent: 'space-between', marginTop:'10px', paddingBottom:'5px'}}>
             <label style={{display:'flex', alignItems:'center', gap:'10px', cursor: 'pointer'}}>
                <div style={{
                    width:'20px', height:'20px', borderRadius:'6px', border: '2px solid rgba(255,255,255,0.5)', 
                    backgroundColor: applyToMap ? 'white' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>
                    {applyToMap && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sidebar-header-bg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <input type="checkbox" checked={applyToMap} onChange={(e) => setApplyToMap(e.target.checked)} style={{display: 'none'}} />
                <span style={{color:'white', fontSize:'0.9rem', fontWeight: 500, userSelect:'none'}}>Haritayı Filtrele</span>
             </label>
             <button style={resetButtonStyle} onClick={handleResetFilters} title="Filtreleri sıfırla"><span>🗑️</span> Sıfırla</button>
          </div>
        </div>
      </div>

      <ul style={wordListStyle}>
        {filteredWordsForList.map(word => (
          <li key={word.id} onClick={() => onWordSelect(word)} style={wordItemStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover-bg)'; e.currentTarget.style.borderLeft = '4px solid var(--sidebar-header-bg)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderLeft = '4px solid transparent'; }}>
            <div style={{fontWeight: 700, fontSize: '1rem'}}>{word.word}</div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'2px'}}>
                <small style={wordDetailStyle}>{word.originLanguage}</small>
                <small style={wordDetailStyle}>{word.period}</small>
            </div>
          </li>
        ))}
        {filteredWordsForList.length === 0 && (
            <div style={{padding:'20px', textAlign:'center', color:'var(--sidebar-text-secondary)', opacity:0.7}}>Sonuç bulunamadı.</div>
        )}
      </ul>

      {wordOfTheDay && (
        <div style={footerStyle} onClick={() => onWordSelect(wordOfTheDay)}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}> GÜNÜN KELİMESİ</div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div><span style={{fontSize: '1.3rem', fontWeight: 800}}>{wordOfTheDay.word}</span></div>
                <div style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>{wordOfTheDay.originLanguage}</div>
            </div>
        </div>
      )}
    </div>
  );
};
export default LeftSidebar;