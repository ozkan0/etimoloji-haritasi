import React from 'react';

const AboutButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

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
      title="Proje hakkında"
      aria-label="Proje hakkında"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      Hakkında
    </button>
  );
};

export default AboutButton;
