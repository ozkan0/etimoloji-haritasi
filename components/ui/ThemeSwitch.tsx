import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--sidebar-text-secondary)',
      }}>
        Tema
      </div>
      <button
        role="switch"
        aria-checked={isDark}
        aria-label="Tema değiştir"
        onClick={toggleTheme}
        style={{
          position: 'relative',
          width: '48px',
          height: '26px',
          flexShrink: 0,
          borderRadius: '999px',
          border: '1px solid var(--sidebar-border-color)',
          backgroundColor: isDark ? '#33415a' : '#e9b949',
          cursor: 'pointer',
          padding: 0,
          transition: 'background-color 0.2s ease',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          transform: isDark ? 'translateX(22px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isDark ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#33415a" stroke="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="12" y1="2" x2="12" y2="4"></line>
              <line x1="12" y1="20" x2="12" y2="22"></line>
              <line x1="4.5" y1="4.5" x2="6" y2="6"></line>
              <line x1="18" y1="18" x2="19.5" y2="19.5"></line>
              <line x1="2" y1="12" x2="4" y2="12"></line>
              <line x1="20" y1="12" x2="22" y2="12"></line>
              <line x1="4.5" y1="19.5" x2="6" y2="18"></line>
              <line x1="18" y1="6" x2="19.5" y2="4.5"></line>
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};

export default ThemeSwitch;
