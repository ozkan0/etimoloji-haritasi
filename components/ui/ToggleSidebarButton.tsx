import React from 'react';

interface ToggleSidebarButtonProps {
  isVisible: boolean;
  onClick: () => void;
  zIndex?: number;
}

const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({ isVisible, onClick, zIndex }) => {
  const dynamicStyle: React.CSSProperties = {
    left: isVisible ? 'var(--left-sidebar-w)' : '0px',
    ...(zIndex !== undefined ? { zIndex } : {}),
  };

  return (
    <button style={dynamicStyle} className="toggle-sidebar-button" onClick={onClick}>
      {isVisible ? '‹' : '›'}
    </button>
  );
};

export default ToggleSidebarButton;