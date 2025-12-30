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

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [data]);

  if (!data) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const { word, position } = data; 

  const popupStyle: React.CSSProperties = {
    top: `${position.y}px`,
    left: `${position.x}px`,
    opacity: isVisible ? 1 : 0,
  };

  return (
    <div className="custom-popup" style={popupStyle}>
      <div className="custom-popup-header">
        <h3>{word.word}</h3>
        <button onClick={handleClose} className="custom-popup-close-btn">×</button>
      </div>
      <div className="custom-popup-body">
        <p>
          <strong>Köken:</strong> {word.originLanguage}
        </p>
        <p>
          <strong>Örnek:</strong> "{word.exampleSentence}"
        </p>
        {/* Buton Kaldırıldı */}
      </div>
    </div>
  );
};

export default CustomPopup;