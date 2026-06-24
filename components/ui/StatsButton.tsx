import React, { useState } from 'react';

const StatsButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const rowStyle: React.CSSProperties = {
    width: '100%',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid var(--sidebar-border-color)',
    backgroundColor: isHovered ? 'var(--accent-soft)' : 'transparent',
    color: 'var(--sidebar-text-primary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'background-color 0.2s ease',
  };

  return (
    <button
      onClick={onClick}
      style={rowStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Veritabanı İstatistikleri"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      İstatistikler
    </button>
  );
};

export default StatsButton;
