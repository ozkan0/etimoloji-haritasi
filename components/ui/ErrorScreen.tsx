import React from 'react';
import { albertSans } from '../../styles/fonts';

interface ErrorScreenProps {
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ onRetry }) => {
  return (
    <div className={`error-screen ${albertSans.className}`}>
      <div className="error-content">
        <h1 className="title">Etimoloji Haritası</h1>
        <p className="subtitle">Veriler yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.</p>
        <button className="retry-button" onClick={onRetry}>
          Tekrar Dene
        </button>
      </div>

      <style jsx>{`
        .error-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #212934;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .error-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 0 24px;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -1px;
        }

        .subtitle {
          font-size: 1rem;
          opacity: 0.7;
          margin: 0;
          font-weight: 400;
          max-width: 420px;
          line-height: 1.5;
        }

        .retry-button {
          margin-top: 8px;
          padding: 12px 32px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          color: white;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.35);
        }

        .retry-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default ErrorScreen;
