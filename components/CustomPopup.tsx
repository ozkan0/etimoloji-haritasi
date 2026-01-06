import React, { useState, useEffect } from 'react';
import { Word } from '../types/types';

export interface PopupData {
  word: Word;
  position: { x: number; y: number };
  latlng: { lat: number; lng: number };
}

interface CustomPopupProps {
  data: PopupData | null; 
  onClose: () => void;
  onShowDetails: (word: Word) => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ data, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const [exampleSentence, setExampleSentence] = useState<string | null>(null);
  const [loadingExample, setLoadingExample] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (data) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      
      setLoadingExample(true);
      setExampleSentence(null);

      fetch(`/api/getTdkMeaning?word=${encodeURI(data.word.word)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((apiData) => {
          if (isMounted) {
            setExampleSentence(apiData.example || null);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error("Popup example fetch error:", err);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingExample(false);
        });

      return () => {
        clearTimeout(timer);
        isMounted = false;
        controller.abort();
      };
    } else {
      setIsVisible(false);
    }
  }, [data?.word.id]);

  if (!data) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const { word, position } = data; 

  const popupStyle: React.CSSProperties = {
    top: `${position.y}px`,
    left: `${position.x}px`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(-50%, -115%) scale(1)' : 'translate(-50%, -115%) scale(0.9)',
    width: '240px',
    padding: '12px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    border: '1px solid var(--popup-border-color)',
    backgroundColor: 'var(--popup-background)',
    color: 'var(--popup-text-primary)',
    position: 'absolute',
    zIndex: 1001,
    fontFamily: 'sans-serif',
    transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    pointerEvents: 'none',
  };

  const contentStyle: React.CSSProperties = {
    pointerEvents: 'auto',
  };

  return (
    <div style={popupStyle}>
      <div style={contentStyle}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            {word.word}
          </h3>
          <button 
            onClick={handleClose} 
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              lineHeight: 1,
              cursor: 'pointer',
              color: 'var(--popup-text-secondary)',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'var(--sidebar-item-hover-bg)',
            color: 'var(--sidebar-text-secondary)',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid var(--sidebar-border-color)',
            display: 'inline-block'
          }}>
            {word.originLanguage}
          </span>
        </div>
        
        <div style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--popup-text-primary)' }}>
          <span style={{ color: 'var(--popup-text-secondary)', fontWeight: 600, marginRight: '4px' }}>
            Örnek:
          </span>
          {loadingExample ? (
            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Yükleniyor...</span>
          ) : (
            <span style={{ fontStyle: 'italic' }}>
              "{exampleSentence || 'Örnek cümle bulunamadı.'}"
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomPopup;