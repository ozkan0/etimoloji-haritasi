// components/RightDetailPanel.tsx

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
      // We use a tiny delay to ensure the transition triggers correctly.
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      // If the word becomes null, hide immediately.
      setIsVisible(false);
    }
  }, [word]);

  // If there's no word, we don't render the component at all.
  if (!word) {
    return null;
  }
  
  // This function handles the closing sequence.
  const handleClose = () => {
    // 1. Start the fade-out animation.
    setIsVisible(false);

    // 2. Wait for the animation to finish (200ms, matching our CSS).
    setTimeout(() => {
      // 3. After fading out, tell the parent to remove the component.
      onClose();
    }, 200);
  };

  // This combines the base style with our dynamic opacity.
  const dynamicPanelStyle: React.CSSProperties = {
    ...panelStyle,
    opacity: isVisible ? 1 : 0, // Opacity is 1 when visible, 0 when not.
  };

  return (
    <div style={dynamicPanelStyle}>
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
    </div>
  );
};

// --- STYLES ---
const panelStyle: React.CSSProperties = {
  width: '350px',
  height: '100%',
  backgroundColor: '#f8f9fa',
  borderLeft: '1px solid #dee2e6',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 1,
  
  // --- This is the key to the animation ---
  // We transition the 'opacity' property over a short 0.2 seconds.
  transition: 'opacity 0.2s ease-in-out',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#00695c',
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