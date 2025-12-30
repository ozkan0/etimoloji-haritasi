import React, { useState, useEffect } from 'react';
import { Word } from '../types/types';

interface LiveTdkData {
  meaning: string;
}

interface RightDetailPanelProps {
  word: Word | null;
  onClose: () => void;
}

const getFlagUrl = (lang: string) => {
  const codeMap: Record<string, string> = {
    'Fransızca': 'fr', 'Türkçe': 'tr', 'Farsça': 'ir', 'İtalyanca': 'it', 'İngilizce': 'gb',
    'Arapça': 'sa', 'Almanca': 'de', 'Yunanca': 'gr', 'Hırvatça': 'hr', 'Çekçe': 'cz',
    'Japonca': 'jp', 'İspanyolca': 'es', 'Rusça': 'ru', 'Bulgarca': 'bg', 'Macarca': 'hu',
    'Moğolca': 'mn', 'Sogdca': 'ir', 'Rumca': 'gr', 'Sırpça': 'rs', 'Ermenice': 'am',
  };
  const code = codeMap[lang];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const RightDetailPanel: React.FC<RightDetailPanelProps> = ({ word }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [liveData, setLiveData] = useState<LiveTdkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isReported, setIsReported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (word) {
      setIsVisible(true);
      setIsMinimized(false);
      setIsLoading(true);
      setLiveData(null);
      setIsReported(false); 

      fetch(`/api/getTdkMeaning?word=${encodeURI(word.word)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            setLiveData(data.meaning ? data : { meaning: data.meaning || 'TDK kaydı bulunamadı.' });
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError' && isMounted) {
            console.error(err);
            setLiveData({ meaning: 'Bağlantı hatası.' });
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
      controller.abort();
      window.speechSynthesis.cancel();
    };
  }, [word]);

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReported) return;
    setIsReported(true);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'tr-TR';
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!word && !isVisible) return null;

  // --- STYLES ---
  let transformValue = 'translateX(100%)';
  if (isVisible) {
    transformValue = isMinimized 
      ? 'translateY(calc(100% - 65px))'
      : 'translateY(0)';
  }

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    right: '0',
    bottom: '0',
    height: 'auto',
    width: '380px',
    backgroundColor: 'var(--sidebar-main-bg)',
    borderLeft: '1px solid var(--sidebar-border-color)',
    borderTop: '1px solid var(--sidebar-border-color)',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
    zIndex: 1002,
    
    
    transform: transformValue,
    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    
    display: 'flex',
    flexDirection: 'column',
    color: 'var(--sidebar-text-primary)',
    fontFamily: 'sans-serif',
    borderTopLeftRadius: '22px',
    borderTopRightRadius: '22px', 
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    padding: '15px 24px',
    backgroundColor: 'var(--detailspanel-header-bg)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderTopLeftRadius: '22px', 
    cursor: 'pointer',
    height: '65px',
    transition: 'background-color 0.2s',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    opacity: isMinimized ? 0 : 1,
    transition: 'opacity 0.2s',
  };

  const footerStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderTop: '1px solid var(--sidebar-border-color)',
    backgroundColor: 'var(--sidebar-item-hover-bg)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingBottom: '30px',
    opacity: isMinimized ? 0 : 1,
    transition: 'opacity 0.2s',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    backgroundColor: 'var(--sidebar-item-hover-bg)',
    border: '1px solid var(--sidebar-border-color)',
    color: 'var(--sidebar-text-secondary)',
    marginRight: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--sidebar-text-secondary)',
    marginBottom: '6px',
    fontWeight: 700,
  };

  const textStyle: React.CSSProperties = { fontSize: '1rem', lineHeight: '1.6', margin: 0 };

  const linkPillStyle: React.CSSProperties = {
    textDecoration: 'none',
    fontSize: '0.8rem',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid var(--sidebar-border-color)',
    color: 'var(--sidebar-text-primary)',
    backgroundColor: 'var(--sidebar-item-hover-bg)',
    fontWeight: 600,
    transition: 'all 0.2s',
    display: 'inline-block'
  };

  return (
    <div style={panelStyle} className="right-panel-modern">
      {/* 1. HEADER (Click to Toggle) */}
      <div 
        style={headerStyle} 
        onClick={toggleMinimize}
        title={isMinimized ? "Paneli Genişlet" : "Paneli Küçült"}
      >
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Detay Paneli</h2>
        </div>
        
        {/* Toggle Icon (Chevron) */}
        <div style={{
            transform: isMinimized ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            fontSize: '1.2rem',
            opacity: 0.8
        }}>
            ▼
        </div>
      </div>

      {word && (
        <>
          {/* 2. CONTENT */}
          <div style={contentStyle}>
            
            {/* Title & TTS */}
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'12px'}}>
                  <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
                    {word.word}
                  </h1>
                  <button 
                    onClick={handleSpeak}
                    title="Sesli Dinle"
                    style={{
                        background: isPlaying ? 'var(--detailspanel-header-bg)' : 'var(--sidebar-item-hover-bg)',
                        border: '1px solid var(--sidebar-border-color)', 
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer', 
                        color: isPlaying ? 'white' : 'var(--sidebar-text-primary)',
                        fontSize: '1.2rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                  >
                    {isPlaying ? '🔊' : '🔈'}
                  </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={badgeStyle}>
                  {getFlagUrl(word.originLanguage) && (
                    <img 
                      src={getFlagUrl(word.originLanguage)!} 
                      alt={word.originLanguage} 
                      style={{ width: '20px', height: '15px', marginRight: '8px', borderRadius: '2px', objectFit: 'cover' }}
                    />
                  )}
                  {word.originLanguage}
                </span>
                <span style={badgeStyle}>{word.period}</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--sidebar-border-color)', margin: 0 }} />

            {/* Meaning */}
            <div>
              <div style={labelStyle}>TDK ANLAMI</div>
              <p style={textStyle}>
                {(isLoading || !liveData) ? (
                  <span style={{ opacity: 0.6, fontStyle: 'italic' }}>Yükleniyor...</span>
                ) : (
                  <>
                    {liveData.meaning}
                    {' '}
                    <span style={{ fontStyle: 'italic', opacity: 0.8, fontSize: '0.9em' }}>
                      (Bkz: <a href={`https://sozluk.gov.tr/?ara=${encodeURI(word.word)}`} target="_blank" rel="noopener noreferrer" style={{color: 'var(--detailspanel-header-bg)', fontWeight:'600'}}>{word.word}</a>)
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Example */}
            <div>
              <div style={labelStyle}>ÖRNEK CÜMLE</div>
              <blockquote style={{ 
                margin: 0, paddingLeft: '12px', borderLeft: '3px solid var(--detailspanel-header-bg)',
                fontStyle: 'italic', opacity: 0.9, background: 'rgba(128,128,128,0.05)', padding: '10px', borderRadius: '0 8px 8px 0'
              }}>
                "{word.exampleSentence}"
              </blockquote>
            </div>

            {/* Source & External Links */}
            <div>
              <div style={labelStyle}>KAYNAK & BAĞLANTILAR</div>
              <p style={{ ...textStyle, fontSize: '0.9rem', opacity: 0.8, marginBottom:'10px' }}>{word.source}</p>
              
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                 <a href={`https://sozluk.gov.tr/?ara=${encodeURI(word.word)}`} target="_blank" rel="noreferrer" style={linkPillStyle}>📚 TDK</a>
                 <a href={`https://www.etimolojiturkce.com/kelime/${encodeURI(word.word)}`} target="_blank" rel="noreferrer" style={linkPillStyle}>🏛️ Etimoloji Türkçe</a>
                 <a href={`https://www.google.com/search?q=${encodeURI(word.word)}+ne+demek`} target="_blank" rel="noreferrer" style={linkPillStyle}>🔍 Google</a>
              </div>
            </div>

          </div>

          {/* 3. FOOTER */}
          <div style={footerStyle}>
            
            {/* Graph Placeholder */}
            <div style={{ 
              height: '60px', border: '2px dashed var(--sidebar-border-color)', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--sidebar-text-secondary)', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
              📊 İstatistik Grafikleri Yakında
            </div>

            {/* Report Button */}
            <div style={{marginTop:'5px'}}>
               <button 
                 onClick={handleReport}
                 disabled={isReported}
                 style={{
                     width: '100%',
                     padding: '10px',
                     background: isReported ? 'transparent' : 'rgba(255, 99, 71, 0.1)', 
                     color: isReported ? 'green' : '#d32f2f',
                     border: isReported ? '1px solid green' : '1px solid rgba(255, 99, 71, 0.3)',
                     borderRadius: '8px',
                     cursor: isReported ? 'default' : 'pointer',
                     fontWeight: 600,
                     fontSize: '0.9rem',
                     transition: 'all 0.2s'
                 }}
               >
                 {isReported ? '✓ Hata Bildirimi Alındı' : '⚠️ Hata / Yanlış Bilgi Bildir'}
               </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default RightDetailPanel;