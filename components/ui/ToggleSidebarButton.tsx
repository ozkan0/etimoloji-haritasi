import React from 'react';

interface ToggleSidebarButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({ isVisible, onClick }) => {
  const dynamicStyle: React.CSSProperties = {
    left: isVisible ? '350px' : '0px',
  };

  return (
    <button style={dynamicStyle} className="toggle-sidebar-button" onClick={onClick}>
      {isVisible ? '‹' : '›'}
    </button>
  );
};

export default ToggleSidebarButton;