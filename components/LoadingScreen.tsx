import React from 'react';

// simple loading screen component, its logic will change to handle loading states in the future
interface LoadingScreenProps {
  isFinished: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isFinished }) => {
  const finalClassName = `loading-screen ${isFinished ? 'finished' : ''}`;

  return (
    <div className={finalClassName}>
      <div className="loading-content">
        <h1>Etimoloji Haritası</h1>
        <p>Yükleniyor...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;