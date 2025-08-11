import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/ThemeContext'; // Import our new provider
import { lora } from '../styles/fonts'; // Import our new font

function MyApp({ Component, pageProps }: AppProps) {
  return (
  <ThemeProvider>
    <main className={lora.className}>
      <Component {...pageProps} />
    </main>
  </ThemeProvider>
);
}

export default MyApp;