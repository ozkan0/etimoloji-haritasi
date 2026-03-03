import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { albertSans } from '../styles/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <main className={`${albertSans.className} ${albertSans.variable}`}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default MyApp;