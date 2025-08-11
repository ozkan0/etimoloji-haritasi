import { Lora } from 'next/font/google';

export const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
});