import React, { useState } from 'react';

const StatsButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1px',
    right: '89px', 
    zIndex: 1000,
    cursor: 'pointer',
    background: 'var(--sidebar-header-bg)',
    border: '1px solid #ccc',
    borderColor: '#555',
    borderRadius: '12px',
    padding: '8px',
    width: '38px',
    height: '38px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    backgroundColor: isHovered ? 'var(--main-buttons-hover-bg)' : 'var(--sidebar-header-bg)',
  };

  return (
    <button 
      onClick={onClick} 
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Veritabanı İstatistikleri"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isHovered ? 'white' : '#e0e0e0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    </button>
  );
};

export default StatsButton;