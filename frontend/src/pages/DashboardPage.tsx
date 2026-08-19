import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { InvoiceModal } from '../components/InvoiceModal';
import { api, formatIDR } from '../services/api';
import { DashboardSummary, SalesTrendItem, Sale, Product } from '../types';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<SalesTrendItem[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, trendRes, salesRes, prodRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/sales-trend'),
        api.get('/dashboard/recent-sales?limit=5'),
        api.get('/products?limit=10')
      ]);

      setSummary(sumRes.data.data);
      setTrend(trendRes.data.data);
      setRecentSales(salesRes.data.data);

      const prods: Product[] = prodRes.data.data;
      setLowStockProducts(prods.filter((p) => p.stock < 20));
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard Utama">
        <LoadingState message="Menyiapkan statistik & data penjualan..." />
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Ringkasan Penjualan">
      {error && <ErrorAlert message={error} />}

      {summary && (
        <div className="grid-stats">
          <StatCard
            title="Total Omset Penjualan"
            value={formatIDR(summary.totalSales)}
            subtitle="Ringkasan akumulasi penjualan"
            icon={DollarSign}
            color="#10b981"
          />
          <StatCard
            title="Total Transaksi"
            value={summary.transactionCount}
            subtitle="Transaksi berhasil dibuat"
            icon={ShoppingBag}
            color="#3b82f6"
          />
          <StatCard
            title="Produk Aktif"
            value={summary.productCount}
            subtitle="Jumlah item dalam katalog"
            icon={Package}
            color="#f59e0b"
          />
          <StatCard
            title="Total Pelanggan"
            value={summary.customerCount}
            subtitle="Pelanggan terdaftar"
            icon={Users}
            color="#06b6d4"
          />
        </div>
      )}

      {/* Sales Trend Chart */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              <span>Grafik Tren Penjualan Harian</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendapatan harian berdasarkan transaksi</p>
          </div>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          {trend && trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27354a" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#151c2c', border: '1px solid #27354a', borderRadius: '8px' }}
                  formatter={(val: any) => [formatIDR(Number(val)), 'Omset']}
                />
                <Area type="monotone" dataKey="totalSales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Belum ada data grafik tren penjualan
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Recent Sales & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Transactions */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Transaksi Terbaru</h3>
            <Link to="/sales" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              <span>Lihat Semua</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>No Invoice</th>
                  <th>Pelanggan</th>
                  <th>Total</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{sale.invoiceNo}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(sale.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td>{sale.customer ? sale.customer.name : 'Guest'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>{formatIDR(sale.totalAmount)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSale(sale)} title="Lihat Struk">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent-warning)' }} />
              <span>Perhatian Stok Produk</span>
            </h3>
            <Link to="/products" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              <span>Kelola Stok</span>
            </Link>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>SKU</th>
                  <th>Stok</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                      <td>
                        <span className={`badge ${p.stock < 10 ? 'badge-danger' : 'badge-warning'}`}>
                          {p.stock} unit
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">{formatIDR(p.price)}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Semua stok produk dalam kondisi aman
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InvoiceModal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} sale={selectedSale} />
    </Layout>
  );
};
