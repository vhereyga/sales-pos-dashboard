import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { api, formatIDR } from '../services/api';
import { Product, PaginatedMeta } from '../types';
import { Plus, Search, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    isActive: true
  });
  const [formError, setFormError] = useState<{ message: string; details?: any[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, search, isActiveFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products', {
        params: { page, limit: 10, search, isActive: isActiveFilter }
      });
      setProducts(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({ sku: '', name: '', price: '', stock: '', isActive: true });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      isActive: p.isActive
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (p: Product) => {
    setDeletingProduct(p);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      sku: formData.sku,
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      isActive: formData.isActive
    };

    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError({
        message: err.message || 'Gagal menyimpan data produk',
        details: err.details
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus produk');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Manajemen Katalog Produk">
      {/* Action Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, maxWidth: '600px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Cari SKU atau Nama Produk..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="input-field"
              style={{ width: '160px' }}
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Non-Aktif</option>
            </select>
          </div>

          {isAdmin && (
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} />
              <span>Tambah Produk</span>
            </button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Products Table */}
      {loading ? (
        <LoadingState message="Memuat daftar produk..." />
      ) : products.length === 0 ? (
        <EmptyState message="Tidak ada produk ditemukan" />
      ) : (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nama Produk</th>
                  <th>Harga Satuan</th>
                  <th>Stok Tersedia</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.sku}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>{formatIDR(p.price)}</td>
                    <td>
                      <span className={`badge ${p.stock < 10 ? 'badge-danger' : p.stock < 25 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock} unit
                      </span>
                    </td>
                    <td>
                      {p.isActive ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <XCircle size={12} /> Non-Aktif
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(p)} title="Edit Produk">
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleOpenDeleteModal(p)} title="Hapus Produk">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Halaman {meta.page} dari {meta.totalPages} (Total {meta.total} Produk)
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

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
      >
        {formError && <ErrorAlert message={formError.message} details={formError.details} />}

        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label">Kode SKU Produk</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: SKU-009"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nama Produk</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Keyboard Wireless"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Harga Satuan (Rp)</label>
              <input
                type="number"
                min="0"
                className="input-field"
                placeholder="150000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jumlah Stok</label>
              <input
                type="number"
                min="0"
                className="input-field"
                placeholder="50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="isActiveCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Produk Aktif dalam Katalog
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Produk"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Apakah Anda yakin ingin menghapus produk <strong style={{ color: '#fff' }}>{deletingProduct?.name}</strong> (SKU: {deletingProduct?.sku})?
          <br />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
            *Jika produk sudah memiliki riwayat transaksi penjualan, produk akan otomatis dinonaktifkan (Soft Delete).
          </span>
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Menghapus...' : 'Ya, Hapus Produk'}
          </button>
        </div>
      </Modal>
    </Layout>
  );
};
