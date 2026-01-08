import React, { useState, useEffect } from 'react';
import { Word } from '../../types/types';
import SubmissionModal from '../ui/SubmissionModal';
// IMPORT SERVICE
import { getWordMeaning, getAiEtymology } from '../../lib/api';

interface LiveTdkData {
  meaning: string;
  example?: string | null;
}

interface RightDetailPanelProps {
  word: Word | null;
  onClose: () => void;
  onFilterTrigger: (type: 'language' | 'period', value: string) => void;
  activeFilterLanguage: string;
  activeFilterPeriod: string;
}

const getFlagUrl = (lang: string) => {
  const codeMap: Record<string, string> = {
    'Fransızca': 'fr', 'Türkçe': 'tr', 'Farsça': 'ir', 'İtalyanca': 'it', 'İngilizce': 'gb',
    'Arapça': 'sa', 'Almanca': 'de', 'Yunanca': 'gr', 'Hırvatça': 'hr', 'Çekçe': 'cz',
    'Japonca': 'jp', 'İspanyolca': 'es', 'Rusça': 'ru', 'Bulgarca': 'bg', 'Macarca': 'hu',
    'Moğolca': 'mn', 'Sogdca': 'ir', 'Rumca': 'gr', 'Sırpça': 'rs', 'Latince': 'va'
  };
  const code = codeMap[lang];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const RightDetailPanel: React.FC<RightDetailPanelProps> = ({ 
    word, 
    onClose, 
    onFilterTrigger, 
    activeFilterLanguage, 
    activeFilterPeriod    
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [liveData, setLiveData] = useState<LiveTdkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  // --- AI ETYMOLOGY STATE ---
  const [aiDetails, setAiDetails] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- SUBMISSION MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'suggestion' | 'report'>('suggestion');
  const [isReported, setIsReported] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (word) {
      setIsVisible(true);
      setIsMinimized(false);
      setIsLoading(true);
      setLiveData(null);
      setIsReported(false); 
      setAiDetails(null); 
      setIsAiLoading(false);

      // --- UPDATED API CALL ---
      getWordMeaning(word.word)
        .then((data) => {
            if (isMounted) {
                setLiveData({ 
                    meaning: data.meaning,
                    example: data.example 
                });
            }
        })
        .catch((err) => {
            if (isMounted) {
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
      controller.abort(); // Note: Our api service wrapper doesn't expose abort signal yet, but this is fine for now
      window.speechSynthesis.cancel();
    };
  }, [word]);

  const toggleMinimize = () => setIsMinimized(prev => !prev);
  const handleClose = (e: React.MouseEvent) => { e.stopPropagation(); setIsVisible(false); setTimeout(onClose, 300); };
  
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'tr-TR';
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  // --- UPDATED AI FETCH HANDLER ---
  const handleFetchAiDetails = async () => {
    if (!word) return;
    setIsAiLoading(true);
    try {
      const data = await getAiEtymology(word.word);
      setAiDetails(data.details || "Analiz yapılamadı.");
    } catch (error) { 
      setAiDetails("Bağlantı hatası."); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  const handleOpenSuggestion = () => { setModalType('suggestion'); setIsModalOpen(true); };
  const handleOpenReport = () => { setModalType('report'); setIsModalOpen(true); };
  const handleSuccess = () => { if (modalType === 'report') setIsReported(true); alert('Bildiriminiz başarıyla gönderildi, teşekkürler!'); };

  const handleBadgeClick = (type: 'language' | 'period', value: string) => {
    if (type === 'language') {
        if (activeFilterLanguage === value) onFilterTrigger('language', 'Tüm Diller');
        else onFilterTrigger('language', value);
    } else {
        if (activeFilterPeriod === value) onFilterTrigger('period', 'Tüm Dönemler');
        else onFilterTrigger('period', value);
    }
  };

  if (!word && !isVisible) return null;

  // --- STYLES ---
  let transformValue = 'translateX(100%)';
  if (isVisible) { transformValue = isMinimized ? 'translateY(calc(100% - 65px))' : 'translateY(0)'; }

  const panelStyle: React.CSSProperties = { position: 'absolute', top: '40px', right: '0', bottom: '0', height: 'auto', width: '380px', backgroundColor: 'var(--sidebar-main-bg)', borderLeft: '1px solid var(--sidebar-border-color)', borderTop: '1px solid var(--sidebar-border-color)', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', zIndex: 1002, transform: transformValue, transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)', display: 'flex', flexDirection: 'column', color: 'var(--sidebar-text-primary)', fontFamily: 'inherit', borderTopLeftRadius: '22px', borderTopRightRadius: '22px', overflow: 'hidden' };
  const headerStyle: React.CSSProperties = { padding: '15px 24px', backgroundColor: 'var(--detailspanel-header-bg)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTopLeftRadius: '22px', cursor: 'pointer', height: '65px', transition: 'background-color 0.2s' };
  const contentStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', opacity: isMinimized ? 0 : 1, transition: 'opacity 0.2s' };
  const footerStyle: React.CSSProperties = { padding: '12px 24px', borderTop: '1px solid var(--sidebar-border-color)', backgroundColor: 'var(--sidebar-item-hover-bg)', flexShrink: 0, display: 'flex', flexDirection: 'row', gap: '12px', paddingBottom: '20px', opacity: isMinimized ? 0 : 1, transition: 'opacity 0.2s' };
  
  const badgeStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'var(--sidebar-item-hover-bg)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-secondary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', gap: '6px', cursor: 'pointer', userSelect: 'none' };
  const getBadgeStyle = (type: 'language' | 'period', value: string): React.CSSProperties => { const isActive = type === 'language' ? (activeFilterLanguage === value) : (activeFilterPeriod === value); return { ...badgeStyle, backgroundColor: isActive ? 'var(--detailspanel-header-bg)' : 'var(--sidebar-item-hover-bg)', border: isActive ? '1px solid transparent' : '1px solid var(--sidebar-border-color)', color: isActive ? 'white' : 'var(--sidebar-text-secondary)', boxShadow: isActive ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)', }; };
  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sidebar-text-secondary)', marginBottom: '8px', fontWeight: 700, display: 'block' };
  const textStyle: React.CSSProperties = { fontSize: '1rem', lineHeight: '1.6', margin: 0 };
  const primaryButtonStyle: React.CSSProperties = { textDecoration: 'none', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px', border: 'none', color: 'white', backgroundColor: 'var(--detailspanel-header-bg)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', flex: '0 0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer' };
  const getRefButtonStyle = (btnId: string): React.CSSProperties => ({ textDecoration: 'none', fontSize: '0.9rem', padding: '12px 14px', borderRadius: '10px', backgroundColor: hoveredBtn === btnId ? 'var(--sidebar-item-hover-bg)' : 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-primary)', fontWeight: 500, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, transform: hoveredBtn === btnId ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hoveredBtn === btnId ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)' });
  const footerActionBtnStyle: React.CSSProperties = { flex: 1, padding: '8px 4px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };

  const aiButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(14, 165, 233, 0.3)',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)', 
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)', 
    transition: 'all 0.2s ease',
  };

  return (
    <div style={panelStyle} className="right-panel-modern">
      {/* Header */}
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
          <div className="right-panel-content" style={contentStyle}>
            {/* Title */}
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'16px'}}>
                  <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>{word.word}</h1>
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
                <span className="shiny-effect" style={getBadgeStyle('language', word.originLanguage)} title="Köken Dili" onClick={() => handleBadgeClick('language', word.originLanguage)}>
                  {getFlagUrl(word.originLanguage) && <img src={getFlagUrl(word.originLanguage)!} alt={word.originLanguage} style={{ width: '20px', height: '15px', borderRadius: '2px', objectFit: 'cover' }} />}
                  {word.originLanguage}
                </span>
                <span className="shiny-effect" style={getBadgeStyle('period', word.period)} title="Girdiği Dönem" onClick={() => handleBadgeClick('period', word.period)}>
                  {word.period}
                </span>
                {word.date && <span style={{...badgeStyle, fontSize: '0.8rem', opacity: 0.9, cursor: 'default'}} title="İlk Tespit Tarihi">{word.date}</span>}
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--sidebar-border-color)', margin: 0 }} />

            <div>
              <div style={labelStyle}>TDK ANLAMI</div>
              <p style={textStyle}>{(isLoading || !liveData) ? (<span style={{ opacity: 0.6, fontStyle: 'italic' }}>Yükleniyor...</span>) : liveData.meaning}</p>
            </div>

            {/* AI SECTION */}
            <div>
                <div style={labelStyle}>ETİMOLOJİK ANALİZ</div>
                
                {!aiDetails && !isAiLoading && (
                    <button 
                        onClick={handleFetchAiDetails}
                        style={aiButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 15px rgba(2, 132, 199, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.25)';
                        }}
                    >
                        <div className="ai-ready-dot"></div>
                        Detaylı Köken Analizi
                    </button>
                )}

                {isAiLoading && (
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--sidebar-item-hover-bg)', border: '1px solid var(--sidebar-border-color)', fontStyle: 'italic', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                        <div className="loading-spinner" style={{width:'14px', height:'14px', border:'2px solid currentColor', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite'}} />
                        <span>Analiz ediliyor...</span>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {aiDetails && (
                    <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', lineHeight: '1.5', fontSize: '0.9rem', color: 'var(--sidebar-text-primary)' }}>
                        {aiDetails}
                    </div>
                )}
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
                 <a href={`https://www.google.com/search?q=${encodeURI(word.word)}+kelime+kökeni`} target="_blank" rel="noreferrer" style={getRefButtonStyle('google')} onMouseEnter={() => setHoveredBtn('google')} onMouseLeave={() => setHoveredBtn(null)}>🔍 Google</a>
              </div>
            </div>
          </div>

          <div style={footerStyle}>
             <button onClick={handleOpenSuggestion} style={{ ...footerActionBtnStyle, background: 'var(--sidebar-item-hover-bg)', border: '1px solid var(--detailspanel-header-bg)', color: 'var(--detailspanel-header-bg)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sidebar-main-bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--sidebar-item-hover-bg)'}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Öneri
             </button>
             <button onClick={handleOpenReport} disabled={isReported} style={{ ...footerActionBtnStyle, background: isReported ? 'transparent' : 'rgba(220, 53, 69, 0.1)', color: isReported ? 'green' : '#dc3545', border: isReported ? '1px solid green' : '1px solid #dc3545', cursor: isReported ? 'default' : 'pointer' }}>
               {isReported ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Bildirildi</>) : (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>Hata Bildir</>)}
             </button>
          </div>
          <SubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} wordName={word.word} wordId={word.id} onSuccess={handleSuccess} />
        </>
      )}
    </div>
  );
};

export default RightDetailPanel;