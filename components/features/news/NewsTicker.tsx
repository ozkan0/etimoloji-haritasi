import React, { useState } from 'react';
import { albertSans } from '../../../styles/fonts';

interface NewsTickerProps {
  newsItems: { id: number; text: string }[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ newsItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  const handleAnimationEnd = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
  };

  return (
    <div className={`ticker-wrapper ${albertSans.className}`}>
      <style jsx>{`
        .ticker-wrapper {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          
          width: 90%;
          max-width: 800px;
          height: 36px;
          
          background-color: rgba(0, 71, 73, 0.9);
          color: white;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;

          /* Block Selection */
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          
          pointer-events: auto; 
          cursor: default;
          
          /* Enforce Font Inheritance */
          font-family: inherit;
        }

        @media (min-width: 768px) {
          .ticker-wrapper {
            width: 60%;
            top: 0px;
          }
        }

        .ticker-inner {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .ticker-text {
          display: inline-block;
          white-space: nowrap;
          padding-left: 20px;
          padding-right: 20px;
          
          animation: ticker-scroll 18s linear infinite;
          
          font-size: 15px;
          font-weight: 500;
          position: absolute;
          width: 100%;
          text-align: center;
          
          /* Inherit Lora from wrapper */
          font-family: inherit;
        }

        @media (min-width: 768px) {
          .ticker-text {
            font-size: 17px;
          }
        }
        
        .ticker-wrapper:hover .ticker-text {
          animation-play-state: paused;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-150%);
            opacity: 0;
          }
        }
      `}</style>

      <div className="ticker-inner">
        <p 
          key={currentIndex} 
          className="ticker-text" 
          onAnimationIteration={handleAnimationEnd}
          onAnimationEnd={handleAnimationEnd}
        >
          {newsItems[currentIndex].text}
        </p>
      </div>
    </div>
  );
};

export default NewsTicker;