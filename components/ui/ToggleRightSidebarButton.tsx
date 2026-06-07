import React from 'react';

interface ToggleRightSidebarButtonProps {
  isVisible: boolean;
  onClick: () => void;
  zIndex?: number;
}

const ToggleRightSidebarButton: React.FC<ToggleRightSidebarButtonProps> = ({ isVisible, onClick, zIndex }) => {
  const dynamicStyle: React.CSSProperties = {
    right: isVisible ? 'calc(var(--right-panel-w) - 1px)' : '0px',
    ...(zIndex !== undefined ? { zIndex } : {}),
  };

  return (
    <button style={dynamicStyle} className="toggle-right-sidebar-button" onClick={onClick}>
      {isVisible ? '›' : '‹'}
    </button>
  );
};

export default ToggleRightSidebarButton;