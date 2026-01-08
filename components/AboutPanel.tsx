import React, { useState, useEffect } from 'react';

interface AboutPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const AboutPanel: React.FC<AboutPanelProps> = ({ isVisible, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  // --- STYLES ---
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease',
    opacity: isVisible ? 1 : 0,
    backdropFilter: 'blur(4px)'
  };

  const panelStyle: React.CSSProperties = {
    // WIDER DESIGN
    width: '850px', 
    maxWidth: '95vw',
    height: 'auto',
    
    position: 'relative',
    backgroundColor: 'var(--sidebar-main-bg)',
    color: 'var(--sidebar-text-primary)',
    borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transform: isVisible ? 'scale(1)' : 'scale(0.95)',
    border: '1px solid var(--sidebar-border-color)',
    fontFamily: 'inherit',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid var(--sidebar-border-color)',
    backgroundColor: 'var(--sidebar-header-bg)',
    color: 'white'
  };

  const bodyStyle: React.CSSProperties = {
    padding: '40px',
    overflowY: 'auto',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  };

  const linkButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    backgroundColor: 'var(--sidebar-text-primary)',
    color: 'var(--sidebar-main-bg)',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'opacity 0.2s',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  const creditBoxStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const creditLabelStyle: React.CSSProperties = {
    fontSize: '0.8rem', 
    color: 'var(--sidebar-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '4px'
  };

  const creditNameStyle: React.CSSProperties = {
    fontSize: '1.1rem', 
    fontWeight: 700
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div 
        style={panelStyle} 
        onTransitionEnd={handleAnimationEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
             <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>Site Hakkında</h2>
          </div>
          <button onClick={onClose} className="icon-close-button">&times;</button>
        </div>
        
        <div style={bodyStyle}> 
          
          <div>
            <p style={{margin: 0, fontSize: '1.1rem', color: 'var(--sidebar-text-primary)'}}>
              Türkçe kelimelerin kökenlerini coğrafi ve tarihsel bir bağlamda keşfetmenizi sağlayan, açık kaynaklı modern bir veri görselleştirme projesidir. 
              TDK ve diğer etimoloji kaynaklarından derlenen verilerle Türkçe'nin zenginliğini ve kelimelerinin yolculuğunu farklı bir yaklaşımla interaktif harita üzerinden öğrenilmesini amaçlar.
            </p>
          </div>

          <div style={{height: '1px', backgroundColor: 'var(--sidebar-border-color)', width: '100%'}}></div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'}}>
            
            <div style={{display: 'flex', gap: '40px'}}>
                <div style={creditBoxStyle}>
                    <span style={creditLabelStyle}>Geliştirici</span>
                    <span style={creditNameStyle}>Ömer ÖZKAN</span>
                </div>
                <div style={creditBoxStyle}>
                    <span style={creditLabelStyle}>Danışman</span>
                    <span style={creditNameStyle}>Prof. Dr. Osman ÖZKARACA</span>
                </div>
            </div>
            
            <a 
              href='https://github.com/ozkan0/etimoloji-haritasi' 
              target="_blank" 
              rel="noreferrer"
              style={linkButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub'da İncele
            </a>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPanel;