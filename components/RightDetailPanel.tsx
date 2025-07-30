import React, { useState, useEffect } from 'react';
import { Word } from '../types';

interface RightDetailPanelProps {
  word: Word | null;
  onClose: () => void;
}

const RightDetailPanel: React.FC<RightDetailPanelProps> = ({ word, onClose }) => {
  // This state controls the opacity for the fade effect.
  const [isVisible, setIsVisible] = useState(false);

  // This effect runs when the 'word' prop from the parent changes.
  useEffect(() => {
    // If we receive a word, it means the panel should start fading in.
    if (word) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      // If the word becomes null, start the fade-out.
      setIsVisible(false);
    }
  }, [word]);

  // If there's no word AND the panel is not visible (animation finished),
  // we render nothing. This prevents a flash of content.
  if (!word && !isVisible) {
    return null;
  }
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // This combines the base style with our dynamic opacity.
  const dynamicPanelStyle: React.CSSProperties = {
    ...panelStyle,
    opacity: isVisible ? 1 : 0,
    // This prevents the user from clicking on the invisible panel
    pointerEvents: isVisible ? 'auto' : 'none', 
  };
  
  return (
    <div style={dynamicPanelStyle}>
      {word && (
        <>
          <div style={panelHeaderStyle}>
            <h2>{word.word}</h2>
            <button onClick={handleClose} style={closeButtonStyle}>×</button>
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
        </>
      )}
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  zIndex: 1001,
  boxShadow: '-3px 0px 15px rgba(0,0,0,0.1)',
  transition: 'opacity 0.2s ease-in-out',

  width: '350px',
  height: '100%',
  backgroundColor: '#f8f9fa',
  borderLeft: '1px solid #dee2e6',
  display: 'flex',
  flexDirection: 'column',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#0094ff',
  color: 'white',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: 'white',
};

const panelBodyStyle: React.CSSProperties = {
  padding: '20px',
  overflowY: 'auto',
  flex: 1,
};

export default RightDetailPanel;