'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Package, User, ChevronRight } from 'lucide-react';
import { getMyOrders } from '@/lib/api';
import { useAuthStore } from '@/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  paid:       'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu Bayar', paid: 'Dibayar', processing: 'Diproses',
  shipped: 'Dikirim', delivered: 'Diterima', cancelled: 'Dibatalkan',
};

export default function AccountPage() {
  const router = useRouter();
  const { customer, logout } = useAuthStore();
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<'orders'|'profile'>('orders');

  useEffect(() => {
    if (!customer) { router.push('/login'); return; }
    getMyOrders().then(r => setOrders(r.data.data.orders || [])).finally(() => setLoading(false));
  }, [customer]);

  const handleLogout = () => { logout(); router.push('/'); };

  if (!customer) return null;

  return (
    <>
      <Header />
      <main className="container py-12 min-h-[70vh]">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-display text-[var(--brand)]" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>AKUN</h1>
            <p className="text-[var(--text-muted)]">Halo, {customer.name}</p>
          </div>
          <button onClick={handleLogout} className="btn-outline py-2.5 px-4 flex items-center gap-2 text-sm">
            <LogOut size={16} /> Keluar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[var(--border)]">
          {[
            { id: 'orders',  label: 'Riwayat Order', icon: Package },
            { id: 'profile', label: 'Profil',         icon: User },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-widest border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-[var(--brand)] text-[var(--brand)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--brand)]'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center border border-[var(--border)]">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="font-display text-3xl text-gray-300 mb-2">BELUM ADA ORDER</p>
              <Link href="/products" className="btn-primary mt-4">Mulai Belanja</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order: any) => (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="bg-white border border-[var(--border)] p-5 flex items-center justify-between hover:border-[var(--brand)] transition-colors group">
                  <div className="flex items-center gap-5">
                    {/* Thumbnail */}
                    {order.items?.[0]?.product_image && (
                      <img src={order.items[0].product_image} alt="" className="w-14 h-14 object-cover flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-mono text-sm font-semibold text-[var(--brand)]">{order.order_number}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{order.items?.length} item
                      </p>
                      <p className="font-bold mt-1">{fmt(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="max-w-md">
            <div className="bg-white border border-[var(--border)] p-8">
              <div className="w-16 h-16 bg-[var(--brand)] text-white flex items-center justify-center font-display text-3xl mb-6">
                {customer.name.charAt(0)}
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Nama', value: customer.name },
                  { label: 'Email', value: customer.email },
                  { label: 'No. WhatsApp', value: customer.phone || '–' },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">{f.label}</p>
                    <p className="font-medium mt-1">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
