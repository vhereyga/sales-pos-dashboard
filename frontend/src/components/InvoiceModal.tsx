import React from 'react';
import { Modal } from './Modal';
import { Sale } from '../types';
import { formatIDR } from '../services/api';
import { Printer, CheckCircle, Store } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, sale }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Struk Penjualan">
      <div id="printable-receipt" style={{ background: '#0b0f19', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginTop: '0.5rem' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>
            <Store size={22} />
            <span>SalesPOS Store</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Struk Penjualan Resmi</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
            <CheckCircle size={14} />
            <span>Transaksi Sukses</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>No. Invoice</span>
            <strong style={{ color: 'var(--primary)' }}>{sale.invoiceNo}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Tanggal</span>
            <span>{new Date(sale.createdAt).toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Pelanggan</span>
            <span>{sale.customer ? sale.customer.name : 'Pelanggan Umum (Guest)'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Kasir</span>
            <span>{sale.user ? sale.user.name : 'Staff'}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Produk</th>
                <th style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>Qty</th>
                <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Harga</th>
                <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.6rem 0' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.product?.name || 'Produk'}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.product?.sku}</span>
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-primary)' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatIDR(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{formatIDR(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total Pembayaran</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-success)' }}>{formatIDR(sale.totalAmount)}</span>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Tutup
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} />
          <span>Cetak Struk</span>
        </button>
      </div>
    </Modal>
  );
};
