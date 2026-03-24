import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/ThemeContext';
import { albertSans } from '../styles/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <main className={`${albertSans.className} ${albertSans.variable}`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default MyApp;