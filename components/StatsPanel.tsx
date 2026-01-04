import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import VerticalBarChart from './graphs/VerticalBarChart';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [langStats, setLangStats] = useState<{label: string, value: number}[]>([]);
  const [periodStats, setPeriodStats] = useState<{label: string, value: number}[]>([]);

  useEffect(() => {
    if (isOpen && langStats.length === 0) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('words')
      .select('originLanguage, period');

    if (error) {
      console.error('Stats fetch error:', error);
      setLoading(false);
      return;
    }

    if (data) {
      const lCounts: Record<string, number> = {};
      const pCounts: Record<string, number> = {};

      data.forEach((row: any) => {
        const lang = row.originLanguage || 'Bilinmiyor';
        lCounts[lang] = (lCounts[lang] || 0) + 1;

        const period = row.period || 'Bilinmiyor';
        pCounts[period] = (pCounts[period] || 0) + 1;
      });

      const sortedLangs = Object.entries(lCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

      const sortedPeriods = Object.entries(pCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

      setLangStats(sortedLangs);
      setPeriodStats(sortedPeriods);
    }
    setLoading(false);
  };

  // --- STYLES ---
  
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1100,
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px', 
    left: '50%',
    width: 'calc(100vw - 780px)',
    minWidth: '600px', 
    maxWidth: '1200px',
    height: '320px', 
    
    transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 120%)',
    opacity: isOpen ? 1 : 0,
    transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease',
    
    backgroundColor: 'var(--sidebar-main-bg)',
    border: '1px solid var(--sidebar-border-color)',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
    
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', 
    zIndex: 1101,
    padding: '30px 40px',
  };

  const contentContainer: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    height: '100%',
    gap: '30px',
  };

  const graphSection: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        
        {loading ? (
            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--sidebar-text-secondary)'}}>
                Veriler Analiz Ediliyor...
            </div>
        ) : (
            <div style={contentContainer}>
                
                <div style={graphSection}>
                    <VerticalBarChart 
                        title="Köken Dili Dağılımı" 
                        data={langStats} 
                        color="#3b82f6" 
                    />
                </div>

                <div style={{width:'1px', backgroundColor:'var(--sidebar-border-color)', height:'80%', alignSelf:'center'}} />

                <div style={graphSection}>
                    <VerticalBarChart 
                        title="Dönem Dağılımı" 
                        data={periodStats} 
                        color="#f59e0b" 
                    />
                </div>

            </div>
        )}

      </div>
    </div>
  );
};

export default StatsPanel;