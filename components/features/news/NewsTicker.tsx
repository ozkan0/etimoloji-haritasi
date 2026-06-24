import React, { useState, useEffect, useRef } from 'react';
import { albertSans } from '../../../styles/fonts';

interface NewsTickerProps {
  newsItems: { id: number; text: string }[];
}

const SCROLL_SPEED_PX_PER_SEC = 80;

const NewsTicker: React.FC<NewsTickerProps> = ({ newsItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const measure = () => {
      const text = textRef.current;
      const inner = innerRef.current;
      if (!text || !inner) return;
      const textW = text.offsetWidth;
      const contW = inner.offsetWidth;
      text.style.setProperty('--ticker-start', `${contW}px`);
      text.style.setProperty('--ticker-end', `${-textW}px`);
      text.style.animationDuration = `${(contW + textW) / SCROLL_SPEED_PX_PER_SEC}s`;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [currentIndex]);

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
          top: 0px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;

          width: calc(100% - 120px);
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

          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;

          pointer-events: auto;
          cursor: default;

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
          font-style: italic;
          color: #F1E9DA;
          position: absolute;
          left: 0;

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
          from {
            transform: translateX(var(--ticker-start, 100%));
          }
          to {
            transform: translateX(var(--ticker-end, -100%));
          }
        }
      `}</style>

      <div className="ticker-inner" ref={innerRef}>
        <p
          key={currentIndex}
          ref={textRef}
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
