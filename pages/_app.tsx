import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/ThemeContext';
import { lora } from '../styles/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <main className={`${lora.className} ${lora.variable}`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default MyApp;