import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BookOpen,
  Store
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Produk', icon: Package },
    { path: '/customers', label: 'Pelanggan', icon: Users },
    { path: '/sales', label: 'Penjualan / POS', icon: ShoppingCart }
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}
        >
          <Store size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>SalesPOS</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>v1.0 Baseline</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={({ isActive }) => ({
                justifyContent: 'flex-start',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                border: isActive ? 'none' : '1px solid transparent',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <a
          href="http://localhost:3000/openapi"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-muted)', fontSize: '0.85rem' }}
        >
          <BookOpen size={16} />
          <span>API OpenAPI Docs</span>
        </a>
      </div>
    </aside>
  );
};
