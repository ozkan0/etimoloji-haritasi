import React from 'react';

interface DataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  title: string;
  data: DataItem[];
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, color = '#0ea5e9' }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <div style={listStyle}>
        {data.map((item, index) => (
          <div key={item.label} style={rowStyle}>
            
            {/* Etiket ve Değer */}
            <div style={headerStyle}>
              <span style={labelStyle}>{item.label}</span>
              <span style={valueStyle}>{item.value}</span>
            </div>

            {/* Bar Arkaplanı */}
            <div style={barBackgroundStyle}>
              <div 
                className="stat-bar"
                style={{
                  ...barFillStyle,
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                  animationDelay: `${index * 0.05}s`
                }}
              />
            </div>

          </div>
        ))}
      </div>

      {/* CSS Animasyonu */}
      <style jsx>{`
        .stat-bar {
          transform-origin: left;
          animation: growBar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes growBar {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--sidebar-text-primary)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  opacity: 0.8
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--sidebar-text-secondary)',
};

const labelStyle: React.CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '80%'
};

const valueStyle: React.CSSProperties = {
  opacity: 0.9,
};

const barBackgroundStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: 'rgba(150, 150, 150, 0.1)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const barFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '4px',
};

export default BarChart;