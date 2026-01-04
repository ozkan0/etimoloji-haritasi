import React, { useMemo } from 'react';

interface TimeSliderProps {
  year: number;
  onChange: (year: number) => void;
  isLeftOpen: boolean;
  isRightOpen: boolean;
  disabled?: boolean;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ year, onChange, isLeftOpen, isRightOpen, disabled = false }) => {
  const minYear = 1000;
  const maxYear = 2026;

  const getPercentage = () => {
    return ((year - minYear) / (maxYear - minYear)) * 100;
  };

  const renderTicks = useMemo(() => {
    const ticks = [];
    for (let i = minYear; i <= maxYear; i += 50) {
      const isCentury = i % 100 === 0;
      ticks.push(
        <div 
          key={i} 
          style={{
            position: 'absolute',
            left: `${((i - minYear) / (maxYear - minYear)) * 100}%`,
            height: isCentury ? '20px' : '10px',
            width: isCentury ? '2px' : '1px',
            backgroundColor: isCentury ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
            bottom: '0',
            transform: 'translateX(-50%)'
          }}
        >
          {isCentury && (
            <span style={{
                position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', 
                fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500
            }}>
                {i}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  }, []);

  // --- STYLES ---
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '0',
    left: isLeftOpen ? '370px' : '0',
    right: isRightOpen ? '400px' : '0',
    height: '70px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 40px 10px 40px',
    zIndex: 1000,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
    pointerEvents: disabled ? 'none' : 'none', 
    transition: 'left 0.3s cubic-bezier(0.25, 1, 0.5, 1), right 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      
      {!disabled && (
        <>
          <div style={{
              position: 'absolute',
              left: `${getPercentage()}%`,
              bottom: '40px',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--detailspanel-header-bg)',
              padding: '4px 10px',
              borderRadius: '6px',
              color: 'white',
              fontWeight: '800',
              fontSize: '1.2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              zIndex: 2,
              pointerEvents: 'none',
              transition: 'left 0.1s ease-out'
          }}>
            {year}
          </div>

          {/* Kırmızı Çizgi */}
          <div style={{
              position: 'absolute',
              left: `${getPercentage()}%`,
              bottom: '0',
              height: '40px',
              width: '2px',
              backgroundColor: '#ff5252',
              zIndex: 1,
              boxShadow: '0 0 10px 1px rgba(255, 82, 82, 0.6)',
              pointerEvents: 'none',
              transition: 'left 0.1s ease-out'
          }} />
        </>
      )}

      <div style={{...rulerContainerStyle, opacity: disabled ? 0.3 : 1}}>
        {renderTicks}
      </div>

      <input 
        type="range" 
        min={minYear}
        max={maxYear}
        value={year} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="chronas-slider"
        style={{...inputStyle, pointerEvents: disabled ? 'none' : 'auto'}}
        disabled={disabled}
      />

      <style jsx>{`
        .chronas-slider {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
          cursor: pointer;
        }
        .chronas-slider:focus { outline: none; }
        .chronas-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 40px; width: 40px;
          background: transparent; cursor: grab; margin-top: -20px; 
        }
        .chronas-slider::-moz-range-thumb {
          height: 40px; width: 40px;
          background: transparent; cursor: grab; border: none;
        }
        .chronas-slider:active::-webkit-slider-thumb { cursor: grabbing; }
      `}</style>
    </div>
  );
};

const rulerContainerStyle: React.CSSProperties = {
  position: 'relative', width: '100%', height: '30px',
  borderBottom: '1px solid rgba(255,255,255,0.3)', marginBottom: '10px',
  pointerEvents: 'none',
  transition: 'opacity 0.3s ease'
};

const inputStyle: React.CSSProperties = {
  position: 'absolute', bottom: '10px', left: '40px',
  width: 'calc(100% - 80px)', height: '40px', zIndex: 3,
  margin: 0
};

export default TimeSlider;