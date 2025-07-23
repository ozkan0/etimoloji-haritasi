// components/RightDetailPanel.tsx

import React from 'react';
import { Word } from '../types';
// Bileşenin alacağı propların tipleri
interface RightDetailPanelProps {
  word: Word | null; // Gösterilecek kelime veya null (panel kapalıysa)
  onClose: () => void; // Paneli kapatma fonksiyonu
}

const RightDetailPanel: React.FC<RightDetailPanelProps> = ({ word, onClose }) => {
  // Eğer gösterilecek bir kelime yoksa, bileşen hiçbir şey render etmez (ekranda görünmez).
  if (!word) {
    return null;
  }

  // --- RENDER ---
  return (
    // Dış katman (arka planı karartmak için)
    <div style={overlayStyle} onClick={onClose}>
      {/* Panel içeriği (tıklamaların arka plana gitmesini engeller) */}
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={panelHeaderStyle}>
          <h2>{word.word}</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>
        <div style={panelBodyStyle}>
          <p><strong>Köken Dili:</strong> {word.originLanguage}</p>
          <p><strong>Dönem:</strong> {word.period}</p>
          <p><strong>Örnek Cümle:</strong> "{word.exampleSentence}"</p>
          <p><strong>Kaynak:</strong> {word.source}</p>
          {word.references && (
            <p>
              <strong>Referans:</strong>{' '}
              <a href={word.references} target="_blank" rel="noopener noreferrer">
                {word.references}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STİL OBJELERİ ---
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-end' // Paneli sağa yasla
};

const panelStyle: React.CSSProperties = {
  width: '400px',
  height: '100%',
  backgroundColor: 'white',
  boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  animation: 'slideIn 0.3s forwards' // CSS animasyonu için
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  borderBottom: '1px solid #eee',
  backgroundColor: '#f8f9fa'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer'
};

const panelBodyStyle: React.CSSProperties = {
  padding: '20px',
  overflowY: 'auto'
};

// Animasyon için CSS'i global olarak eklememiz gerekecek.
// Onu bir sonraki adımda yapacağız.

export default RightDetailPanel;