import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/ThemeContext';
import { lora } from '../styles/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      {/* Apply Lora font globally here */}
      <main className={lora.className}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default MyApp;