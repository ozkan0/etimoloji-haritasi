import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const LanguageSwitch = () => {
    const { language, toggleLanguage } = useLanguage();
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);

    const switchStyle: React.CSSProperties = {
        position: 'absolute',
        top: '1px',
        right: '129px',
        zIndex: 1000,
        cursor: 'pointer',
        background: 'var(--sidebar-header-bg)',
        border: '1px solid #ccc',
        borderRadius: '12px',
        padding: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        fontFamily: 'inherit',
        lineHeight: 1,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        width: '40px',
        height: '40px',
    };

    const darkSwitchStyle: React.CSSProperties = {
        ...switchStyle,
        backgroundColor: 'var(--sidebar-header-bg)',
        borderColor: '#555',
        color: '#fff',
    };

    const switchHoveredStyle: React.CSSProperties = {
        backgroundColor: 'var(--main-buttons-hover-bg)',
        borderColor: '#888',
    };

    return (
        <button
            onClick={toggleLanguage}
            style={{
                ...(theme === 'light' ? switchStyle : darkSwitchStyle),
                ...(isHovered ? switchHoveredStyle : {}),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Toggle language"
        >
            {language === 'tr' ? 'EN' : 'TR'}
        </button>
    );
};

export default LanguageSwitch;
