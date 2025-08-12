import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/ThemeContext';
import { lora } from '../styles/fonts';
import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoadingFinished, setIsLoadingFinished] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  useEffect(() => {
    const finishLoadingTimer = setTimeout(() => {
      setIsLoadingFinished(true);
    }, 1400);

    const unmountTimer = setTimeout(() => {
      setIsUnmounted(true);
    }, 1700);

    return () => {
      clearTimeout(finishLoadingTimer);
      clearTimeout(unmountTimer);
    };
  }, []);
  return (
  <ThemeProvider>
      <Component {...pageProps} />
      {!isUnmounted && <LoadingScreen isFinished={isLoadingFinished} />}
    </ThemeProvider>
);
}

export default MyApp;