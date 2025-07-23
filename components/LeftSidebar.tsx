// components/LeftSidebar.tsx (TAM VE DÜZELTİLMİŞ KOD)

import React, { useState, useMemo } from 'react';
import { Word } from '../types';
// Bileşenin alacağı propların (özelliklerin) tipini tanımlıyoruz
interface LeftSidebarProps {
  allWords: Word[];
  onWordSelect: (word: Word) => void; // Bir kelime seçildiğinde çalışacak fonksiyon
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ allWords, onWordSelect }) => {
  // --- STATE (DURUM) YÖNETİMİ ---
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('Tüm Diller');
  // ÖNCEKİ HATALI SATIR BURADA DÜZELTİLDİ
  const [periodFilter, setPeriodFilter] = useState<'Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet'>('Tüm Dönemler');

  // --- FİLTRELEME MANTIĞI ---
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

  // --- FİLTRE SEÇENEKLERİNİ HAZIRLAMA ---
  const availableLanguages = useMemo(() => ['Tüm Diller', ...new Set(allWords.map(w => w.originLanguage).sort())], [allWords]);
  const availablePeriods: ('Tüm Dönemler' | 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet')[] = ['Tüm Dönemler', 'Osmanlı Öncesi', 'Osmanlı', 'Cumhuriyet'];

  // --- RENDER (EKRANA ÇİZDİRME) ---
  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h2>Etimoloji Haritası</h2>
        <input
          type="text"
          placeholder="Kelime ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        <div style={filterContainerStyle}>
          <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} style={selectStyle}>
            {availableLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value as any)} style={selectStyle}>
            {availablePeriods.map(period => <option key={period} value={period}>{period}</option>)}
          </select>
        </div>
      </div>
      
      <ul style={wordListStyle}>
        {filteredWords.map(word => (
          <li key={word.id} onClick={() => onWordSelect(word)} style={wordItemStyle} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <strong>{word.word}</strong>
            <small style={wordDetailStyle}>{word.originLanguage} / {word.period}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- STİL OBJELERİ ---
const sidebarStyle: React.CSSProperties = {
  width: '350px',
  height: '100vh',
  backgroundColor: '#f8f9fa',
  borderRight: '1px solid #dee2e6',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'sans-serif'
};
const headerStyle: React.CSSProperties = {
  padding: '20px',
  backgroundColor: '#00695c',
  color: 'white'
};
const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginBottom: '10px'
};
const filterContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px'
};
const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px'
};
const wordListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  overflowY: 'auto',
  flex: 1
};
const wordItemStyle: React.CSSProperties = {
  padding: '15px 20px',
  borderBottom: '1px solid #eee',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  transition: 'background-color 0.2s'
};
const wordDetailStyle: React.CSSProperties = {
  color: '#6c757d',
  marginTop: '4px'
};

export default LeftSidebar;