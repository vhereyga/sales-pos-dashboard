import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'var(--primary)'
}) => {
  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{title}</p>
          <h2 style={{ fontSize: '1.6rem', marginTop: '0.35rem', color: 'var(--text-primary)' }}>{value}</h2>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '0.25rem', fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: `rgba(255, 255, 255, 0.05)`,
            border: `1px solid var(--border-color)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          <Icon size={26} />
        </div>
      </div>
    </div>
  );
};
