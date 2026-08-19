import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState: React.FC<{ message?: string }> = ({ message = 'Tidak ada data ditemukan' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
      <Inbox size={42} style={{ strokeWidth: 1.5 }} />
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};
