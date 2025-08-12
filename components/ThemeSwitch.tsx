import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  const switchStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: '6%',
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

  return (
    <button 
      onClick={toggleTheme} 
      style={theme === 'light' ? switchStyle : darkSwitchStyle}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeSwitch;