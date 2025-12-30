import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div className={`loading-screen ${!isLoading ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <h1 className="title">Etimoloji Haritası</h1>
        <div className="loader-line"></div>
        <p className="subtitle">Kelimeler haritaya yerleşiyorlar...</p>
      </div>

      <style jsx>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #212934; /* Dark Theme Background */
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
        }

        .fade-out {
          opacity: 0;
          visibility: hidden;
        }

        .loading-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .title {
          font-family: 'Lora', serif; /* Eğer font yüklüyse */
          font-size: 3rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
          animation: fadeUp 0.8s ease-out;
        }

        .subtitle {
          font-size: 0.9rem;
          opacity: 0.6;
          margin: 0;
          font-weight: 400;
          animation: fadeUp 1s ease-out;
        }

        .loader-line {
          width: 0;
          height: 4px;
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          border-radius: 2px;
          animation: loadWidth 1.5s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes loadWidth {
          0% { width: 0; opacity: 0; }
          50% { width: 100px; opacity: 1; }
          100% { width: 200px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;