import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const switchStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1px',
    right: '18px',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    cursor: 'pointer',
    background: 'var(--sidebar-header-bg)',
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '8px',
    fontSize: '1.2rem',
    lineHeight: 1,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  const darkSwitchStyle: React.CSSProperties = {
    ...switchStyle,
    backgroundColor: 'var(--sidebar-header-bg)',
    borderColor: '#555',
  };
  const switchHoveredStyle: React.CSSProperties = {
    backgroundColor: 'var(--main-buttons-hover-bg)',
    borderColor: '#888',
  };

  return (
    <button 
      onClick={toggleTheme} 
      style={{
        ...(theme === 'light' ? switchStyle : darkSwitchStyle),
        ...(isHovered ? switchHoveredStyle : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeSwitch;