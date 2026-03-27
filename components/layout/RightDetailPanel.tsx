import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../../types/types';
import SubmissionModal from '../ui/SubmissionModal';
import { trackEvent } from '../../lib/analytics';
import { getWordMeaning, getAiEtymology, TdkMeaning } from '../../lib/api';

interface LiveTdkData {
  meanings: TdkMeaning[];
  example?: string | null;
}

interface RightDetailPanelProps {
  word: Word | null;
  isOpen: boolean;
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
  isOpen,
  onClose,
  onFilterTrigger,
  activeFilterLanguage,
  activeFilterPeriod
}) => {
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
  const lastLoadedWordKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (!word) {
      lastLoadedWordKeyRef.current = null;
      return () => {
        isMounted = false;
        controller.abort();
        window.speechSynthesis.cancel();
      };
    }

    const stableWordKey = `${word.id}-${word.word.toLocaleLowerCase('tr-TR')}`;
    if (lastLoadedWordKeyRef.current === stableWordKey) {
      return () => {
        isMounted = false;
        controller.abort();
        window.speechSynthesis.cancel();
      };
    }
    lastLoadedWordKeyRef.current = stableWordKey;

    trackEvent('word_view', { word: word.word, id: word.id, lang: word.originLanguage });
    setIsLoading(true);
    setLiveData(null);
    setIsReported(false);
    setAiDetails(null);
    setIsAiLoading(false);

    getWordMeaning(word.word)
      .then((data) => {
        if (isMounted) {
          setLiveData({
            meanings: data.meanings || [],
            example: data.example
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setLiveData({ meanings: [{ text: 'Bağlantı hatası.' }], example: null });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
      window.speechSynthesis.cancel();
    };
  }, [word?.id, word?.word, word?.originLanguage]);

  const handleClose = (e: React.MouseEvent) => { e.stopPropagation(); setTimeout(onClose, 300); };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'tr-TR';
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleFetchAiDetails = async () => {
    if (!word) return;
    setIsAiLoading(true);
    try {
      const data = await getAiEtymology(word.word);
      setAiDetails(data.details || "Analiz yapılamadı.");
      trackEvent('ai_details_view', { word: word.word, id: word.id });
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

  if (!word) return null;

  // --- STYLES ---
  const detailPanelBodyBg = '#212934';

  let transformValue = 'translateX(100%)';
  if (isOpen) { transformValue = 'translateX(0)'; }

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    right: '0',
    bottom: '0',
    height: 'auto',
    width: 'min(390px, 100vw)',
    backgroundColor: detailPanelBodyBg,
    borderLeft: '1px solid var(--sidebar-border-color)',
    borderTop: '1px solid var(--sidebar-border-color)',
    boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.28)',
    zIndex: 1002,
    transform: transformValue,
    transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
    display: 'flex',
    flexDirection: 'column',
    color: 'var(--sidebar-text-primary)',
    fontFamily: 'inherit',
    borderTopLeftRadius: '22px',
    borderTopRightRadius: '22px',
    overflow: 'hidden'
  };
  const headerStyle: React.CSSProperties = {
    padding: '14px 22px',
    backgroundColor: 'var(--detailspanel-header-bg)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.22)',
    borderTopLeftRadius: '22px',
    height: '56px',
    transition: 'background-color 0.2s'
  };
  const contentStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', opacity: 1, transition: 'opacity 0.2s' };
  const footerStyle: React.CSSProperties = { padding: '12px 24px', borderTop: '1px solid var(--sidebar-border-color)', backgroundColor: detailPanelBodyBg, flexShrink: 0, display: 'flex', flexDirection: 'row', gap: '12px', paddingBottom: '10px', opacity: 1, transition: 'opacity 0.2s' };

  const badgeStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'var(--sidebar-item-hover-bg)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-secondary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', gap: '6px', cursor: 'pointer', userSelect: 'none' };
  const filterBadgeBaseStyle: React.CSSProperties = {
    ...badgeStyle,
    border: '1px solid rgba(255, 243, 224, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    boxShadow: 'none',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: '34px'
  };
  const getBadgeStyle = (type: 'language' | 'period', value: string): React.CSSProperties => {
    const isActive = type === 'language' ? (activeFilterLanguage === value) : (activeFilterPeriod === value);
    return {
      ...filterBadgeBaseStyle,
      border: isActive ? '1px solid #f0b77a' : '1px solid rgba(255, 243, 224, 0.16)',
      backgroundColor: isActive ? 'rgba(240, 183, 122, 0.14)' : 'rgba(255, 255, 255, 0.04)',
      boxShadow: isActive ? '0 0 0 1px rgba(240, 183, 122, 0.15), 0 0 10px rgba(240, 183, 122, 0.25)' : 'none',
      color: isActive ? '#fff3e0' : 'var(--sidebar-text-secondary)'
    };
  };
  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sidebar-text-secondary)', marginBottom: '8px', fontWeight: 700, display: 'block' };
  const textStyle: React.CSSProperties = { fontSize: '0.92rem', lineHeight: '1.55', margin: 0 };
  const primaryButtonStyle: React.CSSProperties = { textDecoration: 'none', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px', border: 'none', color: 'white', backgroundColor: 'var(--detailspanel-header-bg)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', flex: '0 0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer' };
  const getRefButtonStyle = (btnId: string): React.CSSProperties => ({ textDecoration: 'none', fontSize: '0.9rem', padding: '12px 14px', borderRadius: '10px', backgroundColor: hoveredBtn === btnId ? 'var(--sidebar-item-hover-bg)' : 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--sidebar-border-color)', color: 'var(--sidebar-text-primary)', fontWeight: 500, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', flex: 1, transform: hoveredBtn === btnId ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hoveredBtn === btnId ? '0 6px 14px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.08)' });
  const footerActionBtnStyle: React.CSSProperties = { flex: 1, padding: '8px 4px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };

  const aiButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgb(38, 166, 154)',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 14px 0 rgba(11, 21, 23, 0.6)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div style={panelStyle} className="right-panel-modern">
      <div style={headerStyle}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Detay Paneli</h2>
        </div>
      </div>

      {word && (
        <>
          <div className="right-panel-content" style={contentStyle}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '2.35rem', fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.05 }}>{word.word}</h1>
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
                <span className="shiny-effect" style={getBadgeStyle('language', (word as any).ultimateOriginLanguage || word.originLanguage)} title="Köken Dil" onClick={() => handleBadgeClick('language', (word as any).ultimateOriginLanguage || word.originLanguage)}>
                  {getFlagUrl((word as any).ultimateOriginLanguage || word.originLanguage) && <img src={getFlagUrl((word as any).ultimateOriginLanguage || word.originLanguage)!} alt={(word as any).ultimateOriginLanguage || word.originLanguage} style={{ width: '20px', height: '15px', borderRadius: '2px', objectFit: 'cover' }} />}
                  <span style={{ color: 'inherit' }}>{(word as any).ultimateOriginLanguage || word.originLanguage}</span>
                </span>



                <span className="shiny-effect" style={getBadgeStyle('period', word.period)} title="Girdiği Dönem" onClick={() => handleBadgeClick('period', word.period)}>
                  {word.period}
                </span>
                {word.date && <span style={{ ...badgeStyle, fontSize: '0.8rem', opacity: 0.9, cursor: 'default' }} title="İlk Tespit Tarihi">{word.date}</span>}
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--sidebar-border-color)', margin: 0 }} />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ ...labelStyle, marginBottom: 0 }}>TDK ANLAMI</div>
                <a
                  href={`https://sozluk.gov.tr/?kelime=${encodeURIComponent(word.word)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--sidebar-text-secondary)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8, transition: 'all 0.2s', fontWeight: 600 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.textDecoration = 'none'; }}
                  title="TDK'da Sorgula"
                >
                  <span>sayfaya git</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(isLoading || !liveData) ? (
                  <p style={textStyle}><span style={{ opacity: 0.6, fontStyle: 'italic' }}>Yükleniyor...</span></p>
                ) : (
                  liveData.meanings?.map((m, idx) => (
                    <div key={idx} style={{ backgroundColor: '#0e1923', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {liveData.meanings.length > 1 && <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--sidebar-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Anlam {idx + 1}</span>}
                      {m.type && (
                        <span
                          title={m.type}
                          style={{
                            fontFamily: 'var(--font-albert-sans), sans-serif',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: '#D17A5D',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            maxWidth: '140px',
                            lineHeight: 1.2,
                            width: 'fit-content'
                          }}
                        >
                          {m.type}
                        </span>
                      )}
                      <p style={{ ...textStyle, margin: 0, fontFamily: 'var(--font-albert-sans), sans-serif', color: 'var(--sidebar-text-primary)' }}>
                        {m.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>


            <hr style={{ border: 'none', borderBottom: '1px solid var(--sidebar-border-color)', margin: 0 }} />

            <div>
              <div style={labelStyle}>ETİMOLOJİK VERİLER</div>

              <div style={{ backgroundColor: '#1b353b', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid var(--sidebar-border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text-secondary)', fontWeight: 600 }}>Köken Dil:</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#D17A5D' }}>{(word as any).ultimateOriginLanguage || word.originLanguage}</span>
                </div>
                {((word as any).immediateSourceLanguage && (word as any).immediateSourceLanguage !== 'Unknown' && (word as any).immediateSourceLanguage !== ((word as any).ultimateOriginLanguage || word.originLanguage)) && (
                  <>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text-secondary)', fontWeight: 600 }}>Geçiş Dili:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#D17A5D' }}>{(word as any).immediateSourceLanguage}</span>
                    </div>
                  </>
                )}

                {(word.isControversial !== undefined && word.isControversial !== null && word.isControversial !== '') && (
                  <>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text-secondary)', fontWeight: 600 }}>Tartışmalı:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: String(word.isControversial).toLowerCase() === 'true' ? '#f59e0b' : 'inherit' }}>
                        {String(word.isControversial).toLowerCase() === 'true' ? 'Evet' : 'Hayır'}
                      </span>
                    </div>
                  </>
                )}

                {word.originSourceType && (
                  <>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text-secondary)', fontWeight: 600 }}>Köken Türü:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{word.originSourceType}</span>
                    </div>
                  </>
                )}

                {word.formula && (
                  <>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text-secondary)', fontWeight: 600 }}>Formül:</span>
                      <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.9)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {word.formula}
                      </span>
                    </div>
                  </>
                )}

                {word.etymology_text && (
                  <>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '1rem', color: '#FFF3E0', lineHeight: '1.5', fontWeight: 700, opacity: 0.85 }}>{word.etymology_text}</span>
                    </div>
                  </>
                )}

                {word.extraInfo && (
                  <>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text-secondary)', fontWeight: 600 }}>Ek Bilgi:</span>
                      <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.5' }}>{word.extraInfo}</span>
                    </div>
                  </>
                )}

                {word.source && (
                  <>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text-secondary)', fontWeight: 600 }}>En Eski Kaynak:</span>
                      <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic', lineHeight: '1.4' }}>{word.source}</span>
                    </div>
                  </>
                )}

                {!aiDetails && !isAiLoading && (
                  <button
                    onClick={handleFetchAiDetails}
                    style={{
                      ...aiButtonStyle,
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      marginTop: '8px',
                      width: 'fit-content',
                      alignSelf: 'center',
                      fontFamily: 'var(--font-albert-sans), sans-serif',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(11, 21, 23, 0.8)';
                      e.currentTarget.style.backgroundColor = 'rgb(45, 180, 168)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(11, 21, 23, 0.6)';
                      e.currentTarget.style.backgroundColor = 'rgb(38, 166, 154)';
                    }}
                  >
                    <div className="ai-ready-dot" style={{ width: '6px', height: '6px' }}></div>
                    Detaylı Köken Analizi
                  </button>
                )}

                {isAiLoading && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', fontStyle: 'italic', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginTop: '8px', width: 'fit-content', alignSelf: 'center' }}>
                    <div className="loading-spinner" style={{ width: '12px', height: '12px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span>Analiz ediliyor...</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}
              </div>

              {aiDetails && (
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', lineHeight: '1.5', fontSize: '0.9rem', color: 'var(--sidebar-text-primary)' }}>
                  {aiDetails}
                </div>
              )}
            </div>




            <div>
              <span style={labelStyle}>DİJİTAL REFERANSLAR</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={`https://www.etimolojiturkce.com/kelime/${encodeURI(word.word)}`} target="_blank" rel="noreferrer" style={getRefButtonStyle('etimoloji')} onMouseEnter={() => setHoveredBtn('etimoloji')} onMouseLeave={() => setHoveredBtn(null)}>
                  <img src="https://www.etimolojiturkce.com/favicon.ico" alt="etimolojiturkce" style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
                  etimolojiturkce.com
                </a>
                <a href={`https://en.wiktionary.org/wiki/${encodeURI(word.word)}#Turkish`} target="_blank" rel="noreferrer" style={getRefButtonStyle('wiktionary')} onMouseEnter={() => setHoveredBtn('wiktionary')} onMouseLeave={() => setHoveredBtn(null)}>
                  <img src="https://en.wiktionary.org/favicon.ico" alt="wiktionary" style={{ width: '18px', height: '18px', borderRadius: '2px' }} />
                  en.wiktionary.org
                </a>
                <a href={`https://www.nisanyansozluk.com/kelime/${encodeURI(word.word)}`} target="_blank" rel="noreferrer" style={getRefButtonStyle('nisanyan')} onMouseEnter={() => setHoveredBtn('nisanyan')} onMouseLeave={() => setHoveredBtn(null)}>
                  <img src="https://www.nisanyansozluk.com/favicon.ico" alt="nisanyan" style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
                  nisanyansozluk.com
                </a>
                <a href={`https://www.google.com/search?q=${encodeURI(word.word)}+kelime+kökeni`} target="_blank" rel="noreferrer" style={getRefButtonStyle('google')} onMouseEnter={() => setHoveredBtn('google')} onMouseLeave={() => setHoveredBtn(null)}>
                  <img src="https://www.google.com/favicon.ico" alt="google" style={{ width: '18px', height: '18px' }} />
                  google.com
                </a>
              </div>
            </div>
          </div>

          <div style={footerStyle}>
            <button onClick={handleOpenSuggestion} style={{ ...footerActionBtnStyle, background: 'transparent', border: '1.5px solid #00A896', color: '#00A896', borderRadius: '6px', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 168, 150, 0.12)'; e.currentTarget.style.borderColor = '#00C2AE'; e.currentTarget.style.color = '#00C2AE'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#00A896'; e.currentTarget.style.color = '#00A896'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Öneri
            </button>
            <button onClick={handleOpenReport} disabled={isReported} style={{ ...footerActionBtnStyle, background: 'transparent', color: isReported ? 'green' : '#D64545', border: isReported ? '1.5px solid green' : '1.5px solid #D64545', borderRadius: '6px', transition: 'all 0.3s ease', cursor: isReported ? 'default' : 'pointer' }} onMouseEnter={(e) => { if (!isReported) { e.currentTarget.style.background = 'rgba(214, 69, 69, 0.12)'; e.currentTarget.style.borderColor = '#F05252'; e.currentTarget.style.color = '#F05252'; } }} onMouseLeave={(e) => { if (!isReported) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#D64545'; e.currentTarget.style.color = '#D64545'; } }}>
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