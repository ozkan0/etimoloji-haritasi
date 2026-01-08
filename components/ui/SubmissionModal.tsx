import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { albertSans } from '../../styles/fonts';
import { submitFeedback } from '../../lib/api';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'report' | 'suggestion';
  wordName: string;
  wordId: number;
  onSuccess: () => void;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose, type, wordName, wordId, onSuccess }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCategory('');
      setDescription('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Configuration
  const isReport = type === 'report';
  const title = isReport ? 'Hata / Yanlış Bilgi Bildir' : 'Düzenleme / İçerik Öner';
  const themeColor = isReport ? '#ef4444' : '#3b82f6'; 
  
  const options = isReport 
    ? [
        { val: 'wrong_origin', label: 'Yanlış Köken Bilgisi' },
        { val: 'wrong_language', label: 'Yanlış Dil Etiketi' },
        { val: 'typo', label: 'Yazım Hatası' },
        { val: 'wrong_meaning', label: 'Hatalı Anlam/TDK' },
        { val: 'bug', label: 'Site Hatası / Bug' },
        { val: 'other', label: 'Diğer' }
      ]
    : [
        { val: 'better_meaning', label: 'Daha İyi Bir Açıklama' },
        { val: 'add_source', label: 'Kaynak Ekleme' },
        { val: 'add_example', label: 'Örnek Cümle Önerisi' },
        { val: 'etymology_detail', label: 'Etimolojik Detay' },
        { val: 'other', label: 'Diğer' }
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setErrorMsg('Lütfen bir kategori seçiniz.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await submitFeedback({
          type,
          category,
          description,
          wordId,
          wordName,
          userAgent: navigator.userAgent
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
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
    backdropFilter: 'blur(2px)'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--sidebar-main-bg)',
    color: 'var(--sidebar-text-primary)',
    padding: '30px 25px 25px 25px', 
    borderRadius: '16px',
    width: '90%', 
    maxWidth: '450px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
    border: `1px solid ${isReport ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
    position: 'relative',
    animation: 'fadeInScale 0.2s ease-out forwards',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: '1px solid var(--sidebar-border-color)',
    backgroundColor: 'var(--sidebar-item-hover-bg)',
    color: 'var(--sidebar-text-primary)',
    marginBottom: '15px', fontSize: '0.95rem',
    outline: 'none',
  };

  // Portal Content
  const modalContent = (
    <div style={overlayStyle} onClick={onClose} className={albertSans.className}> 
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{position:'absolute', top:'15px', right:'15px', background:'none', border:'none', color:'var(--sidebar-text-secondary)', fontSize:'1.5rem', cursor:'pointer', lineHeight: 1}}>&times;</button>
        
        <h2 style={{
            marginTop: 0, 
            marginBottom: '15px',
            color: themeColor, 
            fontSize: '1.25rem', 
            textAlign: 'center', 
            fontWeight: 700
        }}>
            {title}
        </h2>
        
        <p style={{fontSize:'0.9rem', opacity:0.8, marginBottom:'20px', textAlign: 'center'}}>
          <strong>{wordName}</strong> kelimesi için bildirimde bulunuyorsunuz.
        </p>

        <form onSubmit={handleSubmit}>
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem', fontWeight:600}}>Konu Başlığı</label>
            <select 
                style={inputStyle} 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                required
            >
                <option value="" disabled>Seçiniz...</option>
                {options.map(opt => (
                    <option key={opt.val} value={opt.val}>{opt.label}</option>
                ))}
            </select>

            <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem', fontWeight:600}}>Açıklama / Detay</label>
            <textarea 
                style={{...inputStyle, minHeight:'100px', resize:'vertical'}} 
                placeholder={isReport ? "Hatayı kısaca açıklayınız..." : "Önerinizi detaylandırınız..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            {errorMsg && <p style={{color: '#ef4444', fontSize:'0.85rem', marginBottom:'10px', textAlign: 'center'}}>{errorMsg}</p>}

            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end', marginTop: '10px'}}>
                <button type="button" onClick={onClose} style={{padding:'10px 20px', borderRadius:'8px', border:'none', background:'transparent', color:'var(--sidebar-text-secondary)', cursor:'pointer'}}>İptal</button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                        padding:'10px 20px', borderRadius:'8px', border:'none', 
                        background: themeColor, color:'white', fontWeight:600, cursor: isSubmitting ? 'wait' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SubmissionModal;