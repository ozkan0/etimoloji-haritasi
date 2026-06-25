import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { albertSans } from '../../styles/fonts';
import { getGeminiKey, setGeminiKey } from '../../lib/apiKey';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [keyValue, setKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setKeyValue(getGeminiKey());
      setShowKey(false);
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const themeColor = '#2f86a8';
  const hadKey = getGeminiKey().length > 0;
  const aiModel = 'gemini-2.5-flash';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiKey(keyValue);
    setStatusMsg(keyValue.trim() ? 'Anahtar kaydedildi.' : 'Anahtar kaldırıldı.');
    setTimeout(() => onClose(), 700);
  };

  const handleClear = () => {
    setGeminiKey('');
    setKeyValue('');
    setStatusMsg('Anahtar kaldırıldı.');
  };

  // --- STYLES ---

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(2px)',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--sidebar-main-bg)',
    color: 'var(--sidebar-text-primary)',
    padding: '30px 25px 25px 25px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
    border: '1px solid rgba(47,134,168,0.3)',
    position: 'relative',
    animation: 'fadeInScale 0.2s ease-out forwards',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: '1px solid var(--sidebar-border-color)',
    backgroundColor: 'var(--sidebar-item-hover-bg)',
    color: 'var(--sidebar-text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'var(--font-albert-sans), sans-serif',
    fontWeight: 500,
  };

  const modalContent = (
    <div style={overlayStyle} onClick={onClose} className={albertSans.className}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--sidebar-text-secondary)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>

        <h2 style={{
          marginTop: 0,
          marginBottom: '12px',
          color: themeColor,
          fontSize: '1.25rem',
          textAlign: 'center',
          fontWeight: 700,
          fontFamily: 'var(--font-albert-sans), sans-serif',
        }}>
          Gemini API Anahtarı
        </h2>

        <p style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '18px', textAlign: 'center', fontFamily: 'var(--font-albert-sans), sans-serif', fontWeight: 500, lineHeight: 1.5 }}>
          Google Gemini API anahtarınızı girerek kendi API limitinizle daha fazla AI analizleri yaptırabilirsiniz.
        </p>

        <form onSubmit={handleSave}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-albert-sans), sans-serif' }}>
            API Anahtarı{' '}
            <span style={{ fontStyle: 'italic', fontSize: '0.78rem', fontWeight: 500, color: 'var(--sidebar-text-secondary)', opacity: 0.85 }}>({aiModel})</span>
          </label>
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <input
              style={{ ...inputStyle, paddingRight: '64px' }}
              type={showKey ? 'text' : 'password'}
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowKey(prev => !prev)}
              style={{
                position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--sidebar-text-secondary)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0,
                fontFamily: 'var(--font-albert-sans), sans-serif',
              }}
            >
              {showKey ? 'Gizle' : 'Göster'}
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: '16px', fontFamily: 'var(--font-albert-sans), sans-serif', fontWeight: 500, lineHeight: 1.5 }}>
            Anahtar yalnızca tarayıcınızda saklanır, sunucuya kaydedilmez. Anahtarınızı{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: themeColor, fontWeight: 600 }}>Google AI Studio</a>
            {' '}üzerinden oluşturabilirsiniz.
          </p>

          {statusMsg && <p style={{ color: themeColor, fontSize: '0.85rem', marginBottom: '10px', textAlign: 'center', fontWeight: 600 }}>{statusMsg}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            {hadKey && (
              <button type="button" onClick={handleClear} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--sidebar-border-color)', background: 'transparent', color: 'var(--sidebar-text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-albert-sans), sans-serif', fontWeight: 600 }}>Kaldır</button>
            )}
            <button
              type="submit"
              style={{
                padding: '10px 20px', borderRadius: '8px', border: 'none',
                background: themeColor, color: 'white', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-albert-sans), sans-serif',
              }}
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ApiKeyModal;
