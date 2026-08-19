import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';
import { InvoiceModal } from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import { api, formatIDR } from '../services/api';
import { Product, Customer, Sale, PaginatedMeta } from '../types';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Eye,
  History,
  Store,
  User as UserIcon,
  AlertTriangle
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  // POS State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posLoading, setPosLoading] = useState(true);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [posError, setPosError] = useState<{ message: string; details?: any[] } | null>(null);

  // History State
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesMeta, setSalesMeta] = useState<PaginatedMeta | null>(null);
  const [salesSearch, setSalesSearch] = useState('');
  const [salesPage, setSalesPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Receipt Modal State
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchPOSData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchSalesHistory();
    }
  }, [activeTab, salesPage, salesSearch]);

  const fetchPOSData = async () => {
    setPosLoading(true);
    setPosError(null);
    try {
      const [prodRes, custRes] = await Promise.all([
        api.get('/products?limit=100&isActive=true'),
        api.get('/customers?limit=100')
      ]);
      setProducts(prodRes.data.data);
      setCustomers(custRes.data.data);
    } catch (err: any) {
      setPosError({ message: err.message || 'Gagal memuat data kasir POS' });
    } finally {
      setPosLoading(false);
    }
  };

  const fetchSalesHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await api.get('/sales', {
        params: { page: salesPage, limit: 10, search: salesSearch }
      });
      setSales(res.data.data);
      setSalesMeta(res.data.meta);
    } catch (err: any) {
      setHistoryError(err.message || 'Gagal memuat riwayat transaksi');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setPosError(null);
    const existing = cart.find((item) => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > product.stock) {
      setPosError({
        message: `Stok produk "${product.name}" tidak mencukupi (Tersedia: ${product.stock})`
      });
      return;
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.price
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          subtotal: product.price
        }
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setPosError(null);
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty > item.product.stock) {
      setPosError({
        message: `Stok produk "${item.product.name}" tidak mencukupi (Tersedia: ${item.product.stock})`
      });
      return;
    }

    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart(
      cart.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity: newQty,
              subtotal: newQty * i.product.price
            }
          : i
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const calculateGrandTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setPosError({ message: 'Keranjang belanja masih kosong' });
      return;
    }

    setPosError(null);
    setCheckoutSubmitting(true);

    const payload = {
      customerId: selectedCustomerId ? selectedCustomerId : null,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await api.post('/sales', payload);
      const createdSale: Sale = res.data.data;
      setCart([]);
      setSelectedCustomerId('');
      setSelectedSale(createdSale);
      fetchPOSData(); // Refresh product stock levels
    } catch (err: any) {
      setPosError({
        message: err.message || 'Gagal memproses transaksi penjualan',
        details: err.details
      });
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleFetchSaleDetail = async (id: string) => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSelectedSale(res.data.data);
    } catch (err: any) {
      alert(err.message || 'Gagal mengambil detail struk');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus transaksi ini?')) return;
    try {
      await api.delete(`/sales/${id}`);
      fetchSalesHistory();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus transaksi');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <Layout title="Point of Sale (POS) & Penjualan">
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'pos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pos')}
        >
          <Store size={18} />
          <span>Terminal Kasir POS</span>
        </button>
        <button
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} />
          <span>Riwayat Transaksi Penjualan</span>
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Product Catalog Picker */}
          <div className="glass-card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Katalog Produk</h3>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Cari SKU atau Nama Produk..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </div>

            {posLoading ? (
              <LoadingState message="Memuat produk kasir..." />
            ) : filteredProducts.length === 0 ? (
              <EmptyState message="Tidak ada produk aktif ditemukan" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredProducts.map((p) => {
                  const inCart = cart.find((item) => item.product.id === p.id);
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleAddToCart(p)}
                      style={{
                        background: '#0b0f19',
                        border: `1px solid ${inCart ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: '10px',
                        padding: '0.85rem',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.5 : 1,
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      {inCart && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {inCart.quantity}
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>{p.sku}</span>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>{p.name}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-success)' }}>{formatIDR(p.price)}</span>
                        <span className={`badge ${p.stock < 10 ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                          Stok: {p.stock}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart & Checkout Terminal */}
          <div className="glass-card" style={{ border: '1px solid var(--primary-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} style={{ color: 'var(--primary)' }} />
                <span>Keranjang Transaksi</span>
              </h3>
              <span className="badge badge-info">{cart.length} Item</span>
            </div>

            {posError && <ErrorAlert message={posError.message} details={posError.details} />}

            {/* Customer Selector */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserIcon size={14} /> Pilih Pelanggan (Opsional)
              </label>
              <select
                className="input-field"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Pelanggan Umum (Guest Checkout) --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div style={{ minHeight: '220px', maxHeight: '320px', overflowY: 'auto', margin: '1rem 0', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', background: '#0b0f19' }}>
              {cart.length === 0 ? (
                <EmptyState message="Klik produk di sebelah kiri untuk menambah ke keranjang" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.75rem',
                        background: 'var(--bg-card)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                        <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.product.name}</h5>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatIDR(item.product.price)} / unit
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#0b0f19', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span style={{ fontWeight: 700, fontSize: '0.85rem', minWidth: '80px', textAlign: 'right', color: 'var(--accent-success)' }}>
                          {formatIDR(item.subtotal)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '0.25rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Calculation & Checkout */}
            <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Grand Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                  {formatIDR(calculateGrandTotal())}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
                disabled={cart.length === 0 || checkoutSubmitting}
                onClick={handleCheckout}
              >
                <CheckCircle size={20} />
                <span>{checkoutSubmitting ? 'Memproses Transaksi...' : 'Proses Penjualan Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Historical Sales Tab */
        <div>
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ position: 'relative', maxWidth: '450px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Cari No. Invoice atau Pelanggan..."
                value={salesSearch}
                onChange={(e) => {
                  setSalesSearch(e.target.value);
                  setSalesPage(1);
                }}
              />
            </div>
          </div>

          {historyError && <ErrorAlert message={historyError} />}

          {historyLoading ? (
            <LoadingState message="Memuat riwayat transaksi..." />
          ) : sales.length === 0 ? (
            <EmptyState message="Belum ada riwayat transaksi penjualan" />
          ) : (
            <div className="glass-card" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>No. Invoice</th>
                      <th>Tanggal Transaksi</th>
                      <th>Pelanggan</th>
                      <th>Kasir</th>
                      <th>Jumlah Item</th>
                      <th>Total Transaksi</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{sale.invoiceNo}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(sale.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td>{sale.customer ? sale.customer.name : 'Pelanggan Umum'}</td>
                        <td>{sale.user ? sale.user.name : '-'}</td>
                        <td>
                          <span className="badge badge-info">{sale._count?.items || 1} Item</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>
                          {formatIDR(sale.totalAmount)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleFetchSaleDetail(sale.id)}
                              title="Lihat Detail Struk"
                            >
                              <Eye size={14} />
                              <span>Struk</span>
                            </button>
                            {isAdmin && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteSale(sale.id)}
                                title="Hapus/Void Transaksi"
                              >
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
              {salesMeta && salesMeta.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Halaman {salesMeta.page} dari {salesMeta.totalPages} (Total {salesMeta.total} Transaksi)
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={salesPage === 1}
                      onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                    >
                      Sebelumnya
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={salesPage >= salesMeta.totalPages}
                      onClick={() => setSalesPage((p) => p + 1)}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Invoice Receipt Modal */}
      <InvoiceModal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
      />
    </Layout>
  );
};
