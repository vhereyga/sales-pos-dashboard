import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, details }) => {
  return (
    <div
      style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.25rem',
        color: '#fca5a5',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start'
      }}
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{message}</p>
        {details && details.length > 0 && (
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
            {details.map((d, i) => (
              <li key={i}>{d.field ? `${d.field}: ${d.message}` : d.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
