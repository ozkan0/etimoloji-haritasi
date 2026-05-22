import React from 'react';

interface RefreshMarkersButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
}

const RefreshMarkersButton: React.FC<RefreshMarkersButtonProps> = ({ onClick, isRefreshing }) => {
  return (
    <div style={{ position: 'fixed', top: '1px', right: '56px', zIndex: 1200 }}>
      <button
        onClick={onClick}
        disabled={isRefreshing}
        title="Kelimeleri yenile"
        aria-label="Haritadaki kelimeleri yenile"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: '1px solid var(--sidebar-border-color)',
          backgroundColor: 'var(--sidebar-header-bg)',
          color: 'var(--sidebar-text-primary)',
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
    </div>
  );
};

export default RefreshMarkersButton;
