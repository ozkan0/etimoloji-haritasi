import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const switchStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '38px',
    cursor: 'pointer',
    background: 'var(--sidebar-header-bg)',
    border: '1px solid var(--sidebar-border-color)',
    borderRadius: '10px',
    padding: '8px 10px',
    fontSize: '1rem',
    lineHeight: 1,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--sidebar-text-primary)',
  };
  
  const darkSwitchStyle: React.CSSProperties = {
    ...switchStyle,
    backgroundColor: 'var(--sidebar-header-bg)',
    borderColor: 'var(--sidebar-border-color)',
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