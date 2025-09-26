import React from 'react';
import { useTheme } from '../context/ThemeContext';

const AboutButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { theme } = useTheme();

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1px',
    right: 0,
    zIndex: 1000,
    cursor: 'pointer',
    background: 'var(--sidebar-header-bg)',
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    width: '38px',
    height: '38px',
    color: 'white',
    fontSize: '22px',
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif',
    lineHeight: 1,
  };
  
  const darkButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'var(--sidebar-header-bg)',
    borderColor: '#555',
  };

  return (
    <button 
      onClick={onClick} 
      style={theme === 'light' ? buttonStyle : darkButtonStyle}
      aria-label="Proje hakkında"
    >
      <i>i</i>
    </button>
  );
};

export default AboutButton;