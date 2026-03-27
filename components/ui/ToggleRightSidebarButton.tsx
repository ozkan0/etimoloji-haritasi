import React from 'react';

interface ToggleRightSidebarButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ToggleRightSidebarButton: React.FC<ToggleRightSidebarButtonProps> = ({ isVisible, onClick }) => {
  const PANEL_WIDTH = 380;
  const dynamicStyle: React.CSSProperties = {
    right: isVisible ? `${PANEL_WIDTH - 1}px` : '0px',
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1002,
    width: '30px',
    height: '60px',
    backgroundColor: 'rgb(35, 67, 74)',
    color: 'white',
    border: 'none',
    borderRadius: '8px 0 0 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.2)',
    transition: 'right 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  };

  return (
    <button style={dynamicStyle} className="toggle-right-sidebar-button" onClick={onClick}>
      {isVisible ? '›' : '‹'}
    </button>
  );
};

export default ToggleRightSidebarButton;