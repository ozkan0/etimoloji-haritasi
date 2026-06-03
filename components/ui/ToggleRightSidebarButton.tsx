import React from 'react';

interface ToggleRightSidebarButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ToggleRightSidebarButton: React.FC<ToggleRightSidebarButtonProps> = ({ isVisible, onClick }) => {
  const dynamicStyle: React.CSSProperties = {
    right: isVisible ? 'calc(var(--right-panel-w) - 1px)' : '0px',
  };

  return (
    <button style={dynamicStyle} className="toggle-right-sidebar-button" onClick={onClick}>
      {isVisible ? '›' : '‹'}
    </button>
  );
};

export default ToggleRightSidebarButton;