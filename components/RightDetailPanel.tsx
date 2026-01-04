import React, { useState, useEffect } from 'react';
import { Word } from '../types/types';

interface LiveTdkData {
  meaning: string;
  example?: string | null;
}

interface RightDetailPanelProps {
  word: Word | null;
  onClose: () => void;
  onFilterTrigger: (type: 'language' | 'period', value: string) => void;
  onOpenStats: () => void;
  activeFilterLanguage: string;
  activeFilterPeriod: string;
}

const getFlagUrl = (lang: string) => {
  const codeMap: Record<string, string> = {
    'Fransızca': 'fr', 'Türkçe': 'tr', 'Farsça': 'ir', 'İtalyanca': 'it', 'İngilizce': 'gb',
    'Arapça': 'sa', 'Almanca': 'de', 'Yunanca': 'gr', 'Hırvatça': 'hr', 'Çekçe': 'cz',
    'Japonca': 'jp', 'İspanyolca': 'es', 'Rusça': 'ru', 'Bulgarca': 'bg', 'Macarca': 'hu',
    'Moğolca': 'mn', 'Sogdca': 'ir', 'Rumca': 'gr', 'Sırpça': 'rs', 'Ermenice': 'am',
    'Latince': 'va'
  };
  const code = codeMap[lang];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const RightDetailPanel: React.FC<RightDetailPanelProps> = ({ 
    word, 
    onClose, 
    onFilterTrigger, 
    onOpenStats,
    activeFilterLanguage,
    activeFilterPeriod
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [liveData, setLiveData] = useState<LiveTdkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isReported, setIsReported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

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
            setLiveData({ 
                meaning: data.meaning || 'TDK kaydı bulunamadı.',
                example: data.example 
            });
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError' && isMounted) {
            console.error(err);
            setLiveData({ meaning: 'Bağlantı hatası.', example: null });
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

  const toggleMinimize = () => setIsMinimized(prev => !prev);
  const handleClose = (e: React.MouseEvent) => { e.stopPropagation(); setIsVisible(false); setTimeout(onClose, 300); };
  const handleReport = () => { if (isReported) return; setIsReported(true); };
  
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'tr-TR';
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleBadgeClick = (type: 'language' | 'period', value: string) => {
    if (type === 'language') {
        if (activeFilterLanguage === value) {
            onFilterTrigger('language', 'Tüm Diller');
        } else {
            onFilterTrigger('language', value);
        }
    } else {
        if (activeFilterPeriod === value) {
            onFilterTrigger('period', 'Tüm Dönemler');
        } else {
            onFilterTrigger('period', value);
        }
    }
  };

  if (!word && !isVisible) return null;

  // --- STYLES ---
  let transformValue = 'translateX(100%)';
  if (isVisible) { transformValue = isMinimized ? 'translateY(calc(100% - 65px))' : 'translateY(0)'; }

  const panelStyle: React.CSSProperties = { position: 'absolute', top: '40px', right: '0', bottom: '0', height: 'auto', width: '380px', backgroundColor: 'var(--sidebar-main-bg)', borderLeft: '1px solid var(--sidebar-border-color)', borderTop: '1px solid var(--sidebar-border-color)', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', zIndex: 1002, transform: transformValue, transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)', display: 'flex', flexDirection: 'column', color: 'var(--sidebar-text-primary)', fontFamily: 'sans-serif', borderTopLeftRadius: '22px', borderTopRightRadius: '22px', overflow: 'hidden' };
  const headerStyle: React.CSSProperties = { padding: '15px 24px', backgroundColor: 'var(--detailspanel-header-bg)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTopLeftRadius: '22px', cursor: 'pointer', height: '65px', transition: 'background-color 0.2s' };
  const contentStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', opacity: isMinimized ? 0 : 1, transition: 'opacity 0.2s' };
  const footerStyle: React.CSSProperties = { padding: '20px 24px', borderTop: '1px solid var(--sidebar-border-color)', backgroundColor: 'var(--sidebar-item-hover-bg)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '30px', opacity: isMinimized ? 0 : 1, transition: 'opacity 0.2s' };

  const getBadgeStyle = (type: 'language' | 'period', value: string): React.CSSProperties => {
    const isActive = type === 'language' ? (activeFilterLanguage === value) : (activeFilterPeriod === value);

    return {
        display: 'inline-flex', alignItems: 'center', padding: '10px 14px', borderRadius: '8px',
        fontSize: '0.85rem', fontWeight: 600,
        backgroundColor: isActive ? 'var(--detailspanel-header-bg)' : 'var(--sidebar-item-hover-bg)',
        border: isActive ? '1px solid transparent' : '1px solid var(--sidebar-border-color)',
        color: isActive ? 'white' : 'var(--sidebar-text-secondary)',
        boxShadow: isActive ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
        gap: '6px', cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s'
    };
  };

  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sidebar-text-secondary)', marginBottom: '8px', fontWeight: 700, display: 'block' };
  const textStyle: React.CSSProperties = { fontSize: '1rem', lineHeight: '1.6', margin: 0 };
  const primaryButtonStyle: React.CSSProperties = { textDecoration: 'none', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px', border: 'none', color: 'white', backgroundColor: 'var(--detailspanel-header-bg)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', flex: '0 0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer' };
  const getRefButtonStyle = (btnId: string): React.CSSProperties => ({ textDecoration: 'none', fontSize: '0.9rem', padding: '12px 14px', borderRadius: '10px', backgroundColor: hoveredBtn === btnId ? 'var(--sidebar-item-hover-bg)' : 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-primary)', fontWeight: 500, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, transform: hoveredBtn === btnId ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hoveredBtn === btnId ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)' });
  const dateBadgeStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'var(--sidebar-item-hover-bg)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-secondary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'default', opacity: 0.9 };

  return (
    <div style={panelStyle} className="right-panel-modern">
      {/* HEADER */}
      <div style={headerStyle} onClick={toggleMinimize} title={isMinimized ? "Expand Panel" : "Minimize Panel"}>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Detay Paneli</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ transform: isMinimized ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', fontSize: '1.2rem', opacity: 0.8 }}>▼</div>
        </div>
      </div>

      {word && (
        <>
          <div style={contentStyle}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'16px'}}>
                  <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
                    {word.word}
                  </h1>
                  <button onClick={handleSpeak} title="Sesli Dinle" style={{
                        background: isPlaying ? 'var(--detailspanel-header-bg)' : 'var(--sidebar-item-hover-bg)',
                        border: '1px solid var(--sidebar-border-color)', borderRadius: '50%', width: '40px', height: '40px',
                        cursor: 'pointer', color: isPlaying ? 'white' : 'var(--sidebar-text-primary)',
                        fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}>
                    {isPlaying ? '🔊' : '🔈'}
                  </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {/* KÖKEN BUTONU (Toggle) */}
                <span 
                    className="shiny-effect" 
                    style={getBadgeStyle('language', word.originLanguage)} 
                    title={activeFilterLanguage === word.originLanguage ? "Filtreyi Kaldır" : `${word.originLanguage} kökenli kelimeleri filtrele`}
                    onClick={() => handleBadgeClick('language', word.originLanguage)}
                >
                  {getFlagUrl(word.originLanguage) && (
                    <img src={getFlagUrl(word.originLanguage)!} alt={word.originLanguage} style={{ width: '20px', height: '15px', borderRadius: '2px', objectFit: 'cover' }} />
                  )}
                  {word.originLanguage}
                </span>

                {/* DÖNEM BUTONU (Toggle) */}
                <span 
                    className="shiny-effect" 
                    style={getBadgeStyle('period', word.period)} 
                    title={activeFilterPeriod === word.period ? "Filtreyi Kaldır" : `${word.period} dönemine ait kelimeleri filtrele`}
                    onClick={() => handleBadgeClick('period', word.period)}
                >
                  {word.period}
                </span>

                {word.date && (
                    <span style={dateBadgeStyle} title="İlk Tespit Tarihi">
                        {word.date}
                    </span>
                )}
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--sidebar-border-color)', margin: 0 }} />

            <div>
              <div style={labelStyle}>TDK ANLAMI</div>
              <p style={textStyle}>
                {(isLoading || !liveData) ? (<span style={{ opacity: 0.6, fontStyle: 'italic' }}>Yükleniyor...</span>) : liveData.meaning}
              </p>
            </div>

            <div>
              <div style={labelStyle}>ÖRNEK CÜMLE</div>
              <blockquote style={{ margin: 0, paddingLeft: '12px', borderLeft: '3px solid var(--detailspanel-header-bg)', fontStyle: 'italic', opacity: 0.9, background: 'rgba(128,128,128,0.05)', padding: '10px', borderRadius: '0 8px 8px 0' }}>
                {(isLoading) ? 'Yükleniyor...' : (liveData?.example ? `"${liveData.example}"` : "Örnek cümle bulunamadı.")}
              </blockquote>
            </div>

            <div>
              <span style={labelStyle}>KAYNAK</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--sidebar-item-hover-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--sidebar-border-color)' }}>
                  <div style={{flex: 1, fontSize: '0.95rem', fontWeight: 500}}>{word.source || "Bilinmeyen Kaynak"}</div>
                  <a href={`https://sozluk.gov.tr/?ara=${encodeURI(word.word)}`} target="_blank" rel="noreferrer" style={primaryButtonStyle} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Kaynağa Git ↗</a>
              </div>
            </div>

            <div>
              <span style={labelStyle}>DİJİTAL REFERANSLAR</span>
              <div style={{display:'flex', gap:'12px'}}>
                 <a href={`https://www.etimolojiturkce.com/kelime/${encodeURI(word.word)}`} target="_blank" rel="noreferrer" style={getRefButtonStyle('etimoloji')} onMouseEnter={() => setHoveredBtn('etimoloji')} onMouseLeave={() => setHoveredBtn(null)}>🏛️ Etimoloji TR</a>
                 <a href={`https://www.google.com/search?q=${encodeURI(word.word)}+köken+dili`} target="_blank" rel="noreferrer" style={getRefButtonStyle('google')} onMouseEnter={() => setHoveredBtn('google')} onMouseLeave={() => setHoveredBtn(null)}>🔍 Google</a>
              </div>
            </div>
          </div>

          <div style={footerStyle}>
            <button onClick={onOpenStats} style={{ height: '50px', width: '100%', border: '1px solid var(--sidebar-border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sidebar-text-primary)', fontSize: '0.9rem', backgroundColor: 'var(--sidebar-item-hover-bg)', cursor: 'pointer', fontWeight: 600, gap: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-main-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover-bg)'}><span>📊</span> Veritabanı İstatistiklerini Gör</button>
            <div style={{marginTop:'10px'}}>
               <button onClick={handleReport} disabled={isReported} style={{ width: '100%', padding: '10px', background: isReported ? 'transparent' : 'rgba(255, 99, 71, 0.1)', color: isReported ? 'green' : '#d32f2f', border: isReported ? '1px solid green' : '1px solid rgba(255, 99, 71, 0.3)', borderRadius: '8px', cursor: isReported ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>{isReported ? '✓ Hata Bildirimi Alındı' : '⚠️ Hata / Yanlış Bilgi Bildir'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RightDetailPanel;