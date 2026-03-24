import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import VerticalBarChart from '../features/graphs/VerticalBarChart';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [langStats, setLangStats] = useState<{ label: string, value: number }[]>([]);
  const [immediateLangStats, setImmediateLangStats] = useState<{ label: string, value: number }[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'origin' | 'immediate'>('origin');

  useEffect(() => {
    if (isOpen && langStats.length === 0) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cached_stats')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Stats fetch error:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setLangStats(data.lang_stats || []);
      setImmediateLangStats(data.immediate_lang_stats || []);
      
      if (data.updated_at) {
          const dateObj = new Date(data.updated_at);
          setLastUpdated(dateObj.toLocaleString('tr-TR', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }));
      }
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
    height: '340px',

    transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 120%)',
    opacity: isOpen ? 1 : 0,
    transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s ease',

    backgroundColor: 'var(--sidebar-main-bg)',
    border: '1px solid var(--sidebar-border-color)',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',

    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1101,
    padding: '16px 24px 20px 24px',
  };

  const headerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '1px solid var(--sidebar-border-color)',
  };

  const contentContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    gap: '8px',
  };

  const graphSection: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: isActive ? 'var(--input-bg)' : 'transparent',
    border: `1px solid ${isActive ? 'var(--sidebar-border-color)' : 'transparent'}`,
    color: isActive ? 'var(--sidebar-text-primary)' : 'var(--sidebar-text-secondary)',
    fontSize: '0.75rem',
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const activeData = displayMode === 'origin' ? langStats : immediateLangStats;
  const activeTitle = displayMode === 'origin' ? "Köken Dili Dağılımı" : "Geçiş Dili Dağılımı";
  const activeColor = displayMode === 'origin' ? "#3b82f6" : "#10b981"; // Blue for Origin, Emerald for Immediate

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* Header section with Update Date */}
        <div style={headerStyle}>
            {/* Empty div to push the right-side flex items to the right using space-between */}
            <div />
            
            <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: 'var(--sidebar-text-secondary)',
                fontWeight: 500,
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
            }}>
                {lastUpdated ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            boxShadow: '0 0 8px #10b981'
                        }} />
                        Son Analiz: {lastUpdated}
                    </div>
                ) : (
                    <span>Yükleniyor...</span>
                )}
            </div>
        </div>

        {loading ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sidebar-text-secondary)' }}>
            Veriler Analiz Ediliyor...
          </div>
        ) : (
          <div style={contentContainer}>
            
            <div style={graphSection}>
              <VerticalBarChart
                title={activeTitle}
                data={activeData}
                color={activeColor}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid var(--sidebar-border-color)' }}>
              <button 
                style={buttonStyle(displayMode === 'origin')}
                onClick={() => setDisplayMode('origin')}
              >
                Köken Dil
              </button>
              <button 
                style={buttonStyle(displayMode === 'immediate')}
                onClick={() => setDisplayMode('immediate')}
              >
                Geçiş Dili
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default StatsPanel;