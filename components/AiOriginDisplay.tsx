import React from 'react';

interface AiOriginDisplayProps {
  origin: string | null;
  loading: boolean;
  searchedWord: string;
  hasSearched: boolean;
  onStart: () => void;
}

const AiOriginDisplay: React.FC<AiOriginDisplayProps> = ({ origin, loading, searchedWord, hasSearched, onStart }) => {
  
  // nitial State (Idle)
  if (!hasSearched) {
    return (
      <div style={containerStyle}>
        <div style={rowStyle}>
          <span style={indicatorDotStyle}></span>
          <span>AI Modülü Hazır</span>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={rowStyle}>
          <span style={indicatorDotStyle}></span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Aranıyor: {searchedWord}</span>
            <span className="pulsing-text" style={{ fontWeight: 600 }}>Analiz ediliyor...</span>
          </div>
        </div>
        <style jsx>{`
          .pulsing-text { animation: fadeEffect 1.5s infinite ease-in-out; }
          @keyframes fadeEffect { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        `}</style>
      </div>
    );
  }

  // Result State
  if (origin) {
    return (
      <div style={containerStyle}>
        <div style={labelStyle}>
          AI Köken Analizi (<span style={{ fontStyle: 'bold', color: '#ffb74d' }}>{searchedWord}</span>)
        </div>
        <div style={resultStyle}>
          <span style={highlightStyle}>{origin}</span>
        </div>
      </div>
    );
  }

  // Waiting Mode (Active Button)
  return (
    <div style={containerStyle}>
      <div style={{...rowStyle, justifyContent: 'space-between', width: '100%'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
           <span style={{fontSize:'0.75rem', opacity:0.8, textTransform:'uppercase'}}>AI Sorgusu</span>
           <span style={{fontWeight:'bold', color:'#bae6fd'}}>"{searchedWord}"</span>
        </div>
        
        <button onClick={onStart} style={startButtonStyle} title="Analizi Başlat">
            <img 
              src="/ai-sparkle.png" 
              alt="AI" 
              style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
            />
            <span style={{marginLeft: '6px', fontSize:'0.9rem', fontWeight: 600}}>Analiz Et</span>
        </button>
      </div>
    </div>
  );
};

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  marginBottom: '10px',
  padding: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  minHeight: '60px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: 'rgba(255,255,255, 0.9)',
  fontSize: '0.9rem',
  fontWeight: 500,
};

const indicatorDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  backgroundColor: '#4ade80',
  borderRadius: '50%',
  boxShadow: '0 0 8px #4ade80',
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  opacity: 0.8,
  marginBottom: '4px',
  textAlign: 'center',
};

const resultStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#ffffff',
  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  textAlign: 'center',
};

const highlightStyle: React.CSSProperties = {
  color: '#bae6fd',
};

const startButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 14px',
  backgroundColor: '#077691',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '20px',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
};

export default AiOriginDisplay;