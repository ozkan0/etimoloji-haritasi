import React, { useState, useEffect } from 'react';
import { Word } from '../types/types';

interface LiveTdkData {
  meaning: string;
}
interface RightDetailPanelProps {
  word: Word | null;
  onClose: () => void;
}

const RightDetailPanel: React.FC<RightDetailPanelProps> = ({ word, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [liveData, setLiveData] = useState<LiveTdkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    
    const controller = new AbortController();
    const signal = controller.signal;

    if (word) {
      setIsVisible(true);
      setIsMinimized(false);
      
      const fetchTdkMeaning = async () => {
        setIsLoading(true);
        setLiveData(null);
        try {
          const response = await fetch(`/api/getTdkMeaning?word=${encodeURI(word.word)}`, { signal });
          const data = await response.json();
          
          if (response.ok) {
            setLiveData(data); 
          } else {
            setLiveData({ meaning: data.meaning || 'Veri alınamadı.' });
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted for previous word.');
          } else {
            console.error("Failed to fetch from TDK API proxy:", error);
            setLiveData({ meaning: 'Bir hata oluştu.' });
          }
        }
        setIsLoading(false);
      };

      fetchTdkMeaning();
    } else {
      setIsVisible(false);
    }
    
    return () => {
      controller.abort();
    };
  }, [word]);

  if (!word && !isVisible) { return null; }
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };
  const handleHeaderClick = () => {
    setIsMinimized(prev => !prev);
  };

  const dynamicPanelStyle: React.CSSProperties = {
    ...panelStyle,
    opacity: isVisible ? 1 : 0,
    transform: isMinimized ? 'translateY(calc(100% - 75px))' : 'translateY(0)',
  };
  
  const headerWithCursorStyle: React.CSSProperties = {
    ...panelHeaderStyle,
    cursor: 'pointer',
  };

  return (
    <div style={dynamicPanelStyle} className="right-panel-main">
      {word && (
        <>
          <div style={headerWithCursorStyle} className="right-panel-header" onClick={handleHeaderClick}>
            <h2 style={{margin: 0, flex: 1, fontWeight: 700}}>Detay Paneli</h2>
            <div style={{width: '32px', height: '32px'}} />
            <button onClick={handleClose} className="icon-close-button">&times;</button>
          </div>
          {!isMinimized && (
            <div style={panelBodyStyle}>
              <div style={{padding: '5px'}}>
                
                <div style={customSeparatorStyle}>
                </div>
                <h2 style={{textAlign:'center', flex: 1, fontWeight: 700, fontSize:30}}>{word.word}</h2>
                <div style={customSeparatorStyle}>
                </div>
                <hr style={{margin: '14px 0', marginTop:'40px', border: 'none', borderTop: '1px solid var(--detailspanel-main-bg)'}}/>
                <p><strong>Köken Dili:</strong> {word.originLanguage}</p>
                <p><strong>Dönem:</strong> {word.period}</p>
                <p><strong>Örnek Cümle:</strong> "{word.exampleSentence}"</p>
                <p><strong>Kaynak:</strong> {word.source}</p>
                
              <p>
                <strong>Anlamı:</strong>
                {(isLoading || !liveData) ? (
                  <span style={{ fontStyle: 'italic' }}> Yükleniyor...</span>
                ) : (
                  <>
                  {` ${liveData.meaning} `}
                    <span style={{ fontStyle: 'italic' }}>
                      (Bkz:{' '}
                      <a 
                        href={`https://sozluk.gov.tr/?ara=${encodeURI(word.word)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: 'rgba(110, 232, 212, 1)',
                          textDecoration: 'underline',
                          fontWeight: '500'
                        }}
                      >
                        {word.word}
                      </a>
                      )
                    </span>
                  </>
                )}
              </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: '40px',
  bottom: 0,
  right: 0,
  zIndex: 1001,
  boxShadow: '-3px 0px 15px rgba(0,0,0,0.1)',
  transition: 'opacity 0.2s ease-in-out, transform 0.3s ease-in-out',

  width: '350px',
  height: 'calc(100vh - 16x)', 
  backgroundColor: 'var(--sidebar-main-bg)',
  borderLeft: '1px solid var(--sidebar-border-color)',
  borderTop: '1px solid var(--sidebar-border-color)',
  color: 'var(--sidebar-text-primary)',
  display: 'flex',
  flexDirection: 'column',
  borderTopLeftRadius: '22px',
  borderTopRightRadius: '22px',
  overflow: 'hidden',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px',
  backgroundColor: 'var(--detailspanel-header-bg)',
  color: 'white',
  borderTopLeftRadius: '14px',
  cursor: 'pointer',
  height: '50px',
  flexShrink: 0,
};


const panelBodyStyle: React.CSSProperties = {
  padding: '15px',
  overflowY: 'auto',
  flex: 1,
  color: 'var(--sidebar-text-primary)',
};

const customSeparatorStyle: React.CSSProperties = {
  width: '100%',
  margin: '5px auto',
  height: '3px',
  backgroundColor: 'var(--detailspanel-header-bg)',
  backgroundImage: 'linear-gradient(to right, #5e83baff 50%, transparent 50%)',
  backgroundSize: '15px 3px',
  backgroundRepeat: 'repeat-x',
  border: 'none',
  position: 'relative',
};

export default RightDetailPanel;