import React, { useState, useEffect } from 'react';

interface AboutPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const AboutPanel: React.FC<AboutPanelProps> = ({ isVisible, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease',
    opacity: isVisible ? 1 : 0,
  };

  const panelStyle: React.CSSProperties = {
    width: '50vw',
    height: '60vh',
    position: 'relative',
    backgroundColor: 'var(--sidebar-main-bg)',
    color: 'var(--sidebar-text-primary)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    transform: isVisible ? 'scale(1)' : 'scale(0.95)',
  };


  return (
    <div style={overlayStyle} onClick={onClose}>
      <div 
        style={panelStyle} 
        onTransitionEnd={handleAnimationEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <h2>Site Hakkında</h2>
          <button onClick={onClose} className="icon-close-button">&times;</button>
        </div>
        <div style={bodyStyle}> 
          <p>Proje hakkında tüm bilgiler için github adresi: <a href='https://github.com/ozkan0/etimoloji-haritasi'> https://github.com/ozkan0/etimoloji-haritasi </a></p>
          <p>Harita üzerinde beliren kelimelerin tam koordinatları rastgeledir. Haritadaki kelime sayısı sınırı 35'e artırılmıştır. Her yenilemede kelimeler ve yerleri, köken ülkeleri üzerinde rastgele seçilip yerleştirilir.</p>
          <p></p>
          <p>NewsTicker, sitenin canlılığını artıran bir komponenttir</p>
          <p>Kelime anlamı datayları artık TDK API aracılığıyla canlı veri çekmektedir.</p>
          <p>Bu site henüz başlangıç versiyonlarındadır. Detayları ve gelişimini github sayfasında takip edebilirsiniz.</p>
          <p>Gelecekte detay paneline ekstra etimolojik veriler, ülke bazında istatistik gibi veriler, ekstra kelime hakkında bilgiler gibi verilerin eklenmesi planlanmıştır. Köken ülkesi ve dilimize giriş dönemine göre tek butonla filtreleme, kökeni tartışmalı kelimeler için farklı kaynak kıyaslamaları için referanslar gibi özellikler eklenecek. Kelime hakkında geribildirim yapılabilmesi için mini form eklenecek.</p>
          
          <p><strong>Geliştirici:</strong> Ömer Özkan</p>
        </div>
      </div>
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 25px',
  marginTop: '10px',
  borderBottom: '1px solid var(--sidebar-border-color)',
};

const bodyStyle: React.CSSProperties = {
  padding: '20px',
  overflowY: 'auto',
  flex: 1,
  fontSize: '1rem',
  lineHeight: '1.2',
};

export default AboutPanel;