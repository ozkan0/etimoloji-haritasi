import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Word } from '../../types/types';
import { trackEvent } from '../../lib/analytics';
import { APP_CONFIG, PERIOD_COLORS, PERIOD_NAMES, normalizePeriodLabel } from '../../lib/constants';
import { wordService } from '../../services/wordService';

interface LeftSidebarProps {
  allWords: Word[];
  dailyWord?: Word | null;
  onWordSelect: (word: Word) => void;
  onHomeClick: () => void;
  isVisible: boolean;
  onFilterChange: (searchTerm: string, applyToMap: boolean, activeLang: string, activePeriod: string, languageMode: 'origin' | 'immediate') => void;
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
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
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

const LeftSidebar: React.FC<LeftSidebarProps> = ({ allWords, dailyWord, onWordSelect, onHomeClick, isVisible, onFilterChange, externalFilterTrigger }) => {

  // --- STATE ---
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeLanguageFilter, setActiveLanguageFilter] = useState('Tüm Diller');
  const [activePeriodFilter, setActivePeriodFilter] = useState<'Tüm Dönemler' | 'O. Öncesi' | 'Osmanlı' | 'Cumhuriyet'>('Tüm Dönemler');
  const [languageMode, setLanguageMode] = useState<'origin' | 'immediate'>('origin');

  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeLanguageFilter, activePeriodFilter, languageMode]);

  // --- EXTERNAL TRIGGER ---
  useEffect(() => {
    if (externalFilterTrigger) {
      if (externalFilterTrigger.type === 'language') {
        setActiveLanguageFilter(prev => prev === externalFilterTrigger.value ? 'Tüm Diller' : externalFilterTrigger.value);
      } else if (externalFilterTrigger.type === 'period') {
        const normalizedPeriod = normalizePeriodLabel(externalFilterTrigger.value);
        setActivePeriodFilter(prev => prev === normalizedPeriod ? 'Tüm Dönemler' : normalizedPeriod as any);
      }
    }
  }, [externalFilterTrigger]);

  // --- MANUAL DB SEARCH ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let isMounted = true;
    const executeSearch = async () => {
      setIsSearching(true);
      try {
        const results = await wordService.searchWords(searchQuery);
        if (isMounted) {
          setSearchResults(results);
          setIsFilteredListActive(false);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    executeSearch();

    return () => { isMounted = false; };
  }, [searchQuery]);

  // --- FILTER LOGIC (LIST) ---
  const [isFilteredListActive, setIsFilteredListActive] = useState(false);

  const filteredWordsForList = useMemo(() => {
    const dataSource = (searchQuery.trim() || isFilteredListActive) ? searchResults : allWords;
    return [...dataSource];
  }, [allWords, searchResults, searchQuery, isFilteredListActive]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredWordsForList.length / RESULTS_PER_PAGE) || 1;
  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    return filteredWordsForList.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  }, [filteredWordsForList, currentPage]);


  // --- UPDATE PARENT ---
  useEffect(() => {
    onFilterChange(activeSearchTerm, true, activeLanguageFilter, normalizePeriodLabel(activePeriodFilter), languageMode);
  }, [activeSearchTerm, activeLanguageFilter, activePeriodFilter, languageMode]);

  // --- ANALYTICS TRACKING ---
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      trackEvent('search', { query: searchQuery });
    }
  }, [searchQuery]);

  // --- LANGUAGES ---
  const [completeLangs, setCompleteLangs] = useState<{ origins: string[], immediates: string[] } | null>(null);

  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(data => {
        if (data.origins && data.immediates) {
           setCompleteLangs(data);
        }
      })
      .catch(console.error);
  }, []);

  const availableLanguages = useMemo(() => {
    if (completeLangs) {
       return ['Tüm Diller', ...(languageMode === 'immediate' ? completeLangs.immediates : completeLangs.origins)];
    }

    const coreLanguages = [
      'Türkçe', 'Arapça', 'Fransızca', 'Farsça', 'İtalyanca',
      'Almanca', 'İspanyolca', 'İngilizce', 'Latince', 'Yunanca'
    ];
    let dynamicLangs: string[];
    
    if (languageMode === 'immediate') {
      dynamicLangs = allWords
        .map(w => (w as any).immediateSourceLanguage || (w as any).immediateLanguage || 'Bilinmiyor')
        .filter(lang => lang && lang !== 'Bilinmiyor');
    } else {
      dynamicLangs = allWords.map(w => (w as any).ultimateOriginLanguage || w.originLanguage);
    }
    
    const uniqueLangs = [...new Set([...coreLanguages, ...dynamicLangs])];
    uniqueLangs.sort((a, b) => a.localeCompare(b, 'tr'));
    return ['Tüm Diller', ...uniqueLangs];
  }, [allWords, languageMode, completeLangs]);

  // --- HANDLERS ---
  const handleSearchChange = (val: string) => { setActiveSearchTerm(val); };
  const handleExecuteSearch = () => { setSearchQuery(activeSearchTerm); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleExecuteSearch();
  };
  const handleClearSearch = () => {
    setActiveSearchTerm('');
    setSearchQuery('');
  };

  const handleResetFilters = () => {
    setActiveSearchTerm('');
    setSearchQuery('');
    setActiveLanguageFilter('Tüm Diller');
    setActivePeriodFilter('Tüm Dönemler');
    setIsFilteredListActive(false);
  };

  const [isFetchingList, setIsFetchingList] = useState(false);
  const handleFetchList = async () => {
    setIsFetchingList(true);
    setActiveSearchTerm('');
    setSearchQuery('');
    
    try {
      const results = await wordService.fetchFilteredWords(activeLanguageFilter, normalizePeriodLabel(activePeriodFilter), languageMode, 300);
      setSearchResults(results);
      setIsFilteredListActive(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingList(false);
    }
  };

  // --- STYLES ---
  const dynamicSidebarStyle: React.CSSProperties = { position: 'absolute', height: '100vh', zIndex: 1001, transition: 'transform 0.3s ease-in-out', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.1)', width: '350px', backgroundColor: 'var(--sidebar-main-bg)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-primary)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-lora), serif', borderRadius: '0 22px 22px 0', overflow: 'hidden', transform: isVisible ? 'translateX(0)' : 'translateX(-100%)', };
  const headerStyle: React.CSSProperties = { padding: '20px 20px 15px 20px', backgroundColor: '#2d3a4d', color: 'white' };

  const searchContainerStyle: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%', marginBottom: '15px', marginTop: '14px', backgroundColor: '#1A2629', borderRadius: '8px', border: '1px solid rgba(255, 243, 224, 0.1)', padding: '4px 10px' };
  const searchInputStyle: React.CSSProperties = { flex: 1, border: 'none', background: 'transparent', padding: '10px 5px', color: '#FFF3E0', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' };
  const clearButtonStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)', padding: '0 5px' };

  const wordListStyle: React.CSSProperties = { listStyle: 'none', margin: 0, padding: '10px', overflowY: 'auto', flex: 1, paddingBottom: '90px', backgroundColor: '#172326' };
  const wordItemStyle: React.CSSProperties = { padding: '12px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', borderRadius: '10px', marginBottom: '4px', borderLeft: '4px solid transparent' };
  const wordDetailStyle: React.CSSProperties = { color: '#6A8688', marginTop: '4px', fontSize: '0.8rem', opacity: 0.95 };
  const footerStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: 'var(--sidebar-header-bg)', color: 'white', padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 10, boxShadow: '0 -4px 15px rgba(0,0,0,0.15)', cursor: 'pointer', borderBottomLeftRadius: '22px', borderBottomRightRadius: '22px' };
  const resetButtonStyle: React.CSSProperties = { padding: '8px 16px', backgroundColor: 'rgba(255, 99, 71, 0.15)', border: '1px solid rgba(255, 99, 71, 0.4)', color: '#ffcccc', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', fontFamily: 'inherit' };
  const paginationButtonStyle: React.CSSProperties = { padding: '6px 12px', backgroundColor: 'var(--sidebar-item-hover-bg)', border: '1px solid var(--sidebar-border-color)', color: 'white', borderRadius: '6px', fontSize: '0.8rem', transition: 'all 0.2s', fontFamily: 'inherit' };
  const sliderLabelStyle: React.CSSProperties = { fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const rangeInputStyle: React.CSSProperties = { width: '100%', cursor: 'pointer', accentColor: 'var(--detailspanel-header-bg)' };

  const segmentContainerStyle: React.CSSProperties = { display: 'flex', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px', gap: '4px', marginTop: '10px' };
  const getSegmentStyle = (periodName: string, isActive: boolean): React.CSSProperties => {
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';

    if (isActive) {
      switch (periodName) {
        case PERIOD_NAMES.OSMANLI_ONCESI:
          backgroundColor = PERIOD_COLORS.OSMANLI_ONCESI.bg;
          borderColor = PERIOD_COLORS.OSMANLI_ONCESI.border;
          break;
        case PERIOD_NAMES.OSMANLI:
          backgroundColor = PERIOD_COLORS.OSMANLI.bg;
          borderColor = PERIOD_COLORS.OSMANLI.border;
          break;
        case PERIOD_NAMES.CUMHURIYET:
          backgroundColor = PERIOD_COLORS.CUMHURIYET.bg;
          borderColor = PERIOD_COLORS.CUMHURIYET.border;
          break;
        default:
          backgroundColor = PERIOD_COLORS.DEFAULT;
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
        <style jsx>{` .modern-input::placeholder { color: #FFF3E0; opacity: 0.55; } `}</style>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px' }}>
          <button
            onClick={onHomeClick}
            style={{
              margin: 0,
              padding: 0,
              fontSize: '1.4rem',
              fontWeight: 800,
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            title="Ana sayfaya dön"
          >
            Etimoloji Haritası
          </button>
        </div>

        <div style={searchContainerStyle}>
          <svg onClick={handleExecuteSearch} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, cursor: 'pointer' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            className="modern-input"
            type="text"
            placeholder="Kelime Ara..."
            value={activeSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            style={searchInputStyle}
          />
          {activeSearchTerm && <button onClick={handleClearSearch} style={clearButtonStyle}>×</button>}
        </div>

        {/* Embedded Filters Content */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '14px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.06)'
        }}>
            <CustomDropdown options={availableLanguages} value={activeLanguageFilter} onChange={setActiveLanguageFilter} />

            <div style={{ display: 'flex', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
              <div 
                style={getSegmentStyle('Köken Dil', languageMode === 'origin')} 
                onClick={() => { setLanguageMode('origin'); setActiveLanguageFilter('Tüm Diller'); }}
              >
                Köken Dil
              </div>
              <div 
                style={getSegmentStyle('Geçiş Dili', languageMode === 'immediate')} 
                onClick={() => { setLanguageMode('immediate'); setActiveLanguageFilter('Tüm Diller'); }}
              >
                Geçiş Dili
              </div>
            </div>

            <div style={segmentContainerStyle}>
              <div style={getSegmentStyle('O. Öncesi', activePeriodFilter === 'O. Öncesi')} onClick={() => setActivePeriodFilter(prev => prev === 'O. Öncesi' ? 'Tüm Dönemler' : 'O. Öncesi')}>O. Öncesi</div>
              <div style={getSegmentStyle('Osmanlı', activePeriodFilter === 'Osmanlı')} onClick={() => setActivePeriodFilter(prev => prev === 'Osmanlı' ? 'Tüm Dönemler' : 'Osmanlı')}>Osmanlı</div>
              <div style={getSegmentStyle('Cumhuriyet', activePeriodFilter === 'Cumhuriyet')} onClick={() => setActivePeriodFilter(prev => prev === 'Cumhuriyet' ? 'Tüm Dönemler' : 'Cumhuriyet')}>Cumhuriyet</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px', gap: '8px' }}>
              <button 
                onClick={handleFetchList} 
                disabled={isFetchingList}
                title="Seçili filtreleri listeye getir"
                style={{ 
                  flex: 1,
                  padding: '8px 16px', 
                  backgroundColor: 'rgba(2, 132, 199, 0.25)', 
                  border: '1px solid rgba(2, 132, 199, 0.5)', 
                  color: 'white', 
                  borderRadius: '8px', 
                  cursor: isFetchingList ? 'wait' : 'pointer', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  transition: 'all 0.2s', 
                  fontFamily: 'inherit',
                  opacity: isFetchingList ? 0.7 : 1
                }}>
                {isFetchingList ? 'Yükleniyor...' : 'Listeye Getir'}
              </button>
              <button style={resetButtonStyle} onClick={handleResetFilters} title="Filtreleri sıfırla">Sıfırla</button>
            </div>
        </div>

      </div>

      <ul style={wordListStyle}>
        {!isSearching && (
          <div style={{ padding: '0 10px 10px 10px', fontSize: '0.8rem', color: '#6A8688', display: 'flex', justifyContent: 'space-between' }}>
            <span>{filteredWordsForList.length} kelime bulundu</span>
            {filteredWordsForList.length > 0 && <span>Sayfa {currentPage} / {totalPages}</span>}
          </div>
        )}
        
        {isSearching && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6A8688', opacity: 0.8, fontStyle: 'italic' }}>Aranıyor...</div>
        )}
        
        {!isSearching && paginatedWords.map(word => (
          <li key={`${word.id}-${word.word}`} onClick={() => onWordSelect(word)} style={wordItemStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover-bg)'; e.currentTarget.style.borderLeft = '4px solid var(--sidebar-header-bg)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderLeft = '4px solid transparent'; }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{word.word}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <small style={wordDetailStyle}>{(word as any).ultimateOriginLanguage || word.originLanguage}</small>
              <small style={wordDetailStyle}>{word.period}</small>
            </div>
          </li>
        ))}
        
        {!isSearching && filteredWordsForList.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6A8688', opacity: 0.8 }}>Sonuç bulunamadı.</div>
        )}

        {/* Pagination Controls */}
        {!isSearching && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px', paddingBottom: '15px' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ ...paginationButtonStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'default' : 'pointer' }}
            >
              Önceki
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'white' }}>{currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ ...paginationButtonStyle, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer' }}
            >
              Sonraki
            </button>
          </div>
        )}
      </ul>

      {dailyWord && (
        <div className="word-of-the-day-card" onClick={() => onWordSelect(dailyWord)}>
          <div className="word-of-the-day-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            GÜNÜN KELİMESİ
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <div className="word-of-the-day-title">{dailyWord.word}</div>
            <div className="word-of-the-day-lang">{(dailyWord as any).ultimateOriginLanguage || dailyWord.originLanguage}</div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeftSidebar;