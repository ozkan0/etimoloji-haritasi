import React, { useState, useRef, useEffect } from 'react';
import ThemeSwitch from './ThemeSwitch';
import AboutButton from './AboutButton';
import StatsButton from './StatsButton';

interface SettingsMenuProps {
  onAboutClick: () => void;
  onStatsClick: () => void;
  limitPerLang: number;
  onLimitChange: (value: number) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onAboutClick, onStatsClick, limitPerLang, onLimitChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapEffectsEnabled, setMapEffectsEnabled] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('mapEffectsEnabled');
    if (stored !== null) {
      setMapEffectsEnabled(stored === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mapEffectsEnabled', String(mapEffectsEnabled));
    document.body.setAttribute('data-map-effects', mapEffectsEnabled ? 'on' : 'off');
  }, [mapEffectsEnabled]);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: '1px', right: '10px', zIndex: 1200 }}>
      <button
        onClick={toggleMenu}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: '1px solid var(--sidebar-border-color)',
          backgroundColor: isOpen ? 'var(--main-buttons-hover-bg)' : 'var(--sidebar-header-bg)',
          color: 'var(--sidebar-text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'var(--main-buttons-hover-bg)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'var(--sidebar-header-bg)';
        }}
        title="Settings"
      >
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      <div style={{
        position: 'absolute',
        top: '44px',
        right: 0,
        width: '240px',
        backgroundColor: 'var(--sidebar-main-bg)',
        border: '1px solid var(--sidebar-border-color)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'top right',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px',
          borderBottom: '1px solid var(--sidebar-border-color)',
        }}>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--sidebar-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '10px',
          }}>
            Haritada Dil Başına Kelime
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <input
              type="range"
                min="5"
                max="25"
              value={limitPerLang}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: 'var(--sidebar-border-color)',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--sidebar-text-primary)',
              minWidth: '20px',
              textAlign: 'center',
              backgroundColor: 'var(--sidebar-item-hover-bg)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--sidebar-border-color)',
            }}>
              {limitPerLang}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
          }}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--sidebar-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}>
              Harita Efektleri
            </div>
            <button
              role="switch"
              aria-checked={mapEffectsEnabled}
              aria-label="Harita efektlerini aç/kapat"
              onClick={() => setMapEffectsEnabled(prev => !prev)}
              style={{
                position: 'relative',
                width: '40px',
                height: '22px',
                flexShrink: 0,
                borderRadius: '999px',
                border: '1px solid var(--sidebar-border-color)',
                backgroundColor: mapEffectsEnabled
                  ? 'var(--primary-action-emerald)'
                  : 'var(--sidebar-border-color)',
                cursor: 'pointer',
                padding: 0,
                transition: 'background-color 0.2s ease',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                transform: mapEffectsEnabled ? 'translateX(18px)' : 'translateX(0)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </button>
          </div>
        </div>
        
        <div style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <ThemeSwitch />
          <AboutButton onClick={onAboutClick} />
          <StatsButton onClick={onStatsClick} />
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
