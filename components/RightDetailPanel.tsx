import React, { useState, useEffect } from 'react';
import { Word } from '../types/types';

interface RightDetailPanelProps {
  word: Word | null;
  onClose: () => void;
}

const RightDetailPanel: React.FC<RightDetailPanelProps> = ({ word, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (word) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [word]);

  if (!word && !isVisible) {
    return null;
  }
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const dynamicPanelStyle: React.CSSProperties = {
    ...panelStyle,
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none', 
  };
  
  return (
    <div style={dynamicPanelStyle} className="right-panel-main">
      {word && (
        <>
          <div style={panelHeaderStyle} className="right-panel-header">
            <h2>{word.word}</h2>
            <button onClick={handleClose} style={closeButtonStyle}>×</button>
          </div>
          <div style={panelBodyStyle}>
            <p><strong>Anlamı:</strong> {word.meaning}</p>
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
  backgroundColor: 'var(--sidebar-main-bg)',
  borderLeft: '1px solid var(--sidebar-border-color)',
  color: 'var(--sidebar-text-primary)',
  display: 'flex',
  flexDirection: 'column',
  borderTopLeftRadius: '14px',
  borderBottomLeftRadius: '12px',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px',
  backgroundColor: 'var(--detailspanel-header-bg)',
  color: 'white',
  borderTopLeftRadius: '14px',
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
  color: 'var(--sidebar-text-primary)',
};

export default RightDetailPanel;