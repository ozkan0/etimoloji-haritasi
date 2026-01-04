import React from 'react';

interface DataItem {
  label: string;
  value: number;
}

interface VerticalBarChartProps {
  title: string;
  data: DataItem[];
  color?: string;
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ title, data, color = '#0ea5e9' }) => {
  const maxValue = Math.max(...data.map(d => d.value)) || 1;

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      
      {/* Scrollable Chart Area */}
      <div className="hide-scrollbar" style={chartAreaStyle}>
        {data.map((item, index) => (
          <div key={item.label} style={columnContainerStyle}>
            
            <span style={valueStyle}>{item.value}</span>

            <div style={barWrapperStyle}>
              <div 
                className="vertical-bar"
                style={{
                  ...barFillStyle,
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                  animationDelay: `${index * 0.05}s`
                }}
              />
            </div>

            <span style={labelStyle} title={item.label}>
              {item.label}
            </span>

          </div>
        ))}
      </div>

      <style jsx>{`
        .vertical-bar {
          transform-origin: bottom;
          animation: growUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform: scaleY(0);
        }
        @keyframes growUp {
          to { transform: scaleY(1); }
        }
        /* Scrollbar Gizleme */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// --- STYLES ---
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  overflow: 'hidden'
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 15px 0',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--sidebar-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  textAlign: 'center'
};

const chartAreaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end', 
  gap: '8px',
  overflowX: 'auto', 
  overflowY: 'hidden',
  height: '100%',
  paddingBottom: '5px',
  maskImage: 'linear-gradient(to right, black 90%, transparent 100%)'
};

const columnContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '100%',
  minWidth: '45px',
  flex: '0 0 auto',
};

const barWrapperStyle: React.CSSProperties = {
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  flex: 1,
  borderRadius: '4px',
  marginBottom: '6px',
};

const barFillStyle: React.CSSProperties = {
  width: '20px',
  borderRadius: '6px',
  minHeight: '4px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
};

const valueStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'var(--sidebar-text-primary)',
  marginBottom: '2px',
  opacity: 0.8
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  color: 'var(--sidebar-text-secondary)',
  textAlign: 'center',
  fontWeight: 500,
  lineHeight: '1.1',
  width: '100%',
  wordWrap: 'break-word',
  whiteSpace: 'normal',
};

export default VerticalBarChart;