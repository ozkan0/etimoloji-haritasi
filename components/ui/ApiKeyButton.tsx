import React, { useState } from 'react';

const ApiKeyButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
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
      title="Gemini API anahtarı"
      aria-label="Gemini API anahtarı"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5"></circle>
        <path d="m21 2-9.6 9.6"></path>
        <path d="m15.5 7.5 3 3L22 7l-3-3"></path>
      </svg>
      API Anahtarı
    </button>
  );
};

export default ApiKeyButton;
