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

const CustomPopup: React.FC<CustomPopupProps> = ({ data, onClose, onShowDetails }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [data]);
  // If there is no data, we should not try to render the popup.
  // We return null to render nothing.
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
        <button 
          className="custom-popup-details-btn" 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              onShowDetails(word);
            }, 200);
          }}
        >
          Detayları Göster
        </button>
      </div>
    </div>
  );
};


export default CustomPopup;