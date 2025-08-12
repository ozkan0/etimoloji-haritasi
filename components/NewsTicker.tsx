
import React, { useState, useEffect } from 'react';

interface NewsTickerProps {
  newsItems: { id: number; text: string }[];
}
// --- COMPONENT: NewsTicker ---
// under construction
const NewsTicker: React.FC<NewsTickerProps> = ({ newsItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (newsItems.length === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
        setIsVisible(true);
      }, 300);

    }, 10000);

    return () => clearInterval(intervalId);
  }, [newsItems]);

  if (newsItems.length === 0) {
    return null;
  }

  const textStyle: React.CSSProperties = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: isVisible ? 1 : 0,
  };

  return (
    <div style={tickerContainerStyle}>
      <p style={textStyle}>
        {newsItems[currentIndex].text}
      </p>
    </div>
  );
};

// --- STYLES ---
const tickerContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '2px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  width: '60%',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  maxWidth: '800px',
  backgroundColor: '#004749ff',
  color: 'white',
  borderRadius: '18px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '0 0',
  textAlign: 'center',
  fontFamily: '--font-lora',
  fontSize: '16px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(5px)',
};

export default NewsTicker;