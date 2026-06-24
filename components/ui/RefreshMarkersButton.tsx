import React, { useEffect, useRef, useState } from 'react';

interface RefreshMarkersButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
  armed: boolean;
  panelOpen: boolean;
  isMobile: boolean;
}

const HINT_KEY = 'etim_refresh_hint_seen';

const RefreshMarkersButton: React.FC<RefreshMarkersButtonProps> = ({ onClick, isRefreshing, armed, panelOpen, isMobile }) => {
  const [seen, setSeen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const wasShowingRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(HINT_KEY)) setSeen(true); } catch {}
  }, []);

  const shouldShow = armed && !seen && !panelOpen;

  useEffect(() => {
    if (shouldShow) {
      if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
      setIsClosing(false);
    } else if (wasShowingRef.current) {
      setIsClosing(true);
      closeTimer.current = setTimeout(() => setIsClosing(false), 200);
    }
    wasShowingRef.current = shouldShow;
  }, [shouldShow]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const markSeen = () => {
    setSeen(true);
    try { localStorage.setItem(HINT_KEY, '1'); } catch {}
  };

  const handleClick = () => {
    markSeen();
    onClick();
  };

  return (
    <div style={{ position: 'fixed', top: '1px', zIndex: 1001, ...(isMobile ? { left: '10px' } : { right: '54px' }) }}>
      <button
        onClick={handleClick}
        disabled={isRefreshing}
        title="Kelimeleri yenile"
        aria-label="Haritadaki kelimeleri yenile"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: '1px solid var(--sidebar-border-color)',
          backgroundColor: 'var(--sidebar-header-bg)',
          color: '#FFFFFF',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
          opacity: isRefreshing ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isRefreshing) e.currentTarget.style.backgroundColor = 'var(--main-buttons-hover-bg)';
        }}
        onMouseLeave={(e) => {
          if (!isRefreshing) e.currentTarget.style.backgroundColor = 'var(--sidebar-header-bg)';
        }}
      >
        <svg
          className={`refresh-markers-icon${isRefreshing ? ' spinning' : ''}`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
      </button>

      {(shouldShow || isClosing) && (
        <div
          onClick={markSeen}
          role="button"
          aria-label="İpucunu kapat"
          style={{
            position: 'absolute',
            top: '46px',
            ...(isMobile ? { left: '0' } : { right: '0' }),
            backgroundColor: 'var(--hint-bubble-bg)',
            color: '#FFFFFF',
            border: '1px solid var(--sidebar-border-color)',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.28)',
            cursor: 'pointer',
            userSelect: 'none',
            fontFamily: 'inherit',
            animation: isClosing ? 'hintBubbleOut 0.2s ease forwards' : 'hintBubbleIn 0.25s ease',
          }}
        >
          Yeni kelimeler getirir
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              ...(isMobile ? { left: '15px' } : { right: '15px' }),
              width: '10px',
              height: '10px',
              backgroundColor: 'var(--hint-bubble-bg)',
              borderLeft: '1px solid var(--sidebar-border-color)',
              borderTop: '1px solid var(--sidebar-border-color)',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RefreshMarkersButton;
