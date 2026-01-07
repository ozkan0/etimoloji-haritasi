import { Lora } from 'next/font/google';

export const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
  display: 'swap',
});