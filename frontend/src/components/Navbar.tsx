import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="top-navbar">
      <div>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#1e293b',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <UserIcon size={18} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {user.name}
              </p>
              <span className={`badge ${user.role === 'ADMIN' ? 'badge-info' : 'badge-success'}`} style={{ marginTop: '0.2rem' }}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button onClick={logout} className="btn btn-secondary btn-sm" title="Keluar">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
