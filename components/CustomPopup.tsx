import React from 'react';
import { Word } from '../types';

export interface PopupData {
  word: Word;
  position: { x: number; y: number };
}

interface CustomPopupProps {
  data: PopupData;
  onClose: () => void;
  onShowDetails: (word: Word) => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ data, onClose, onShowDetails }) => {
  const { word, position } = data;

  const popupStyle: React.CSSProperties = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div className="custom-popup" style={popupStyle}>
      <div className="custom-popup-header">
        <h3>{word.word}</h3>
        <button onClick={onClose} className="custom-popup-close-btn">×</button>
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
          onClick={() => onShowDetails(word)}
        >
          Detayları Göster
        </button>
      </div>
    </div>
  );
};

export default CustomPopup;