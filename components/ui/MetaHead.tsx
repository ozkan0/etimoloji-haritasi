import Head from 'next/head';
import { Word } from '../../types/types';

interface MetaHeadProps {
  selectedWord: Word | null;
}

const MetaHead: React.FC<MetaHeadProps> = ({ selectedWord }) => {
  // Base constants
  const siteName = 'Etimoloji Haritası';
  const baseUrl = 'https://etimoloji-haritasi.vercel.app';
  const defaultDesc = 'Türkçe kelimelerin kökenlerini coğrafi ve tarihsel bir bağlamda keşfetmenizi sağlayan interaktif harita.';

  // Dynamic values
  const title = selectedWord 
    ? `${selectedWord.word} - ${siteName}` 
    : siteName;

  const description = selectedWord
    ? `"${selectedWord.word}" kelimesinin kökeni: ${selectedWord.originLanguage}. ${selectedWord.period} döneminde dilimize girmiştir. Detaylar için tıklayın.`
    : defaultDesc;


  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={baseUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={baseUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
};

export default MetaHead;