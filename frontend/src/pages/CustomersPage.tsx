import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Customer, PaginatedMeta } from '../types';
import { Plus, Search, Edit3, Trash2, Mail, Phone, User as UserIcon } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [formError, setFormError] = useState<{ message: string; details?: any[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/customers', {
        params: { page, limit: 10, search }
      });
      setCustomers(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      email: c.email || '',
      phone: c.phone || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (c: Customer) => {
    setDeletingCustomer(c);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email ? formData.email : null,
      phone: formData.phone ? formData.phone : null
    };

    try {
      if (editingCustomer) {
        await api.patch(`/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setFormError({
        message: err.message || 'Gagal menyimpan data pelanggan',
        details: err.details
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setSubmitting(true);
    try {
      await api.delete(`/customers/${deletingCustomer.id}`);
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pelanggan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Direktori Master Pelanggan">
      {/* Action Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '450px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari Nama, Email, atau Telepon..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Customers Table */}
      {loading ? (
        <LoadingState message="Memuat daftar pelanggan..." />
      ) : customers.length === 0 ? (
        <EmptyState message="Tidak ada pelanggan ditemukan" />
      ) : (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama Pelanggan</th>
                  <th>Email</th>
                  <th>Nomor Telepon</th>
                  <th>Terdaftar Pada</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserIcon size={16} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                      </div>
                    </td>
                    <td>
                      {c.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                          <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{c.email}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>- Tidak ada email -</span>
                      )}
                    </td>
                    <td>
                      {c.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                          <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>- Tidak ada telepon -</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(c.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(c)} title="Edit Pelanggan">
                          <Edit3 size={14} />
                        </button>
                        {isAdmin && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleOpenDeleteModal(c)} title="Hapus Pelanggan">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Halaman {meta.page} dari {meta.totalPages} (Total {meta.total} Pelanggan)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
      >
        {formError && <ErrorAlert message={formError.message} details={formError.details} />}

        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap Pelanggan</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email (Opsional)</label>
            <input
              type="email"
              className="input-field"
              placeholder="budi@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Telepon (Opsional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="081234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Pelanggan"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Apakah Anda yakin ingin menghapus pelanggan <strong style={{ color: '#fff' }}>{deletingCustomer?.name}</strong>?
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Menghapus...' : 'Ya, Hapus Pelanggan'}
          </button>
        </div>
      </Modal>
    </Layout>
  );
};
