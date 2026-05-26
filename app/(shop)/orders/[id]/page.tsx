'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, Package, Truck, Home, ChevronRight } from 'lucide-react';
import { getOrder } from '@/lib/api';
import { useAuthStore } from '@/store';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const STATUS_STEPS = ['pending','paid','processing','shipped','delivered'];
const STATUS_LABELS: Record<string, string> = {
  pending:    'Menunggu Pembayaran',
  paid:       'Pembayaran Diterima',
  processing: 'Sedang Diproses',
  shipped:    'Dalam Pengiriman',
  delivered:  'Sudah Diterima',
  cancelled:  'Dibatalkan',
  refunded:   'Dikembalikan',
};
const STATUS_ICONS: Record<string, any> = {
  pending: Clock, paid: CheckCircle, processing: Package,
  shipped: Truck, delivered: Home,
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const { customer } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(Number(params.id)).then(r => {
      setOrder(r.data.data.order);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="container py-20 text-center">
      <div className="w-12 h-12 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!order) return (
    <div className="container py-20 text-center">
      <p className="font-display text-5xl text-gray-200 mb-4">404</p>
      <p className="text-[var(--text-muted)] mb-6">Order tidak ditemukan</p>
      <Link href="/" className="btn-primary">Kembali ke Home</Link>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="container py-12 max-w-3xl">
      {/* Success banner */}
      {(status === 'success' || order.payment_status === 'paid') && (
        <div className="bg-green-50 border border-green-200 p-6 mb-8 flex items-center gap-4">
          <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-green-800 text-lg">Pembayaran Berhasil!</h2>
            <p className="text-green-600 text-sm">Terima kasih! Order kamu sedang kami proses.</p>
          </div>
        </div>
      )}

      {/* Order header */}
      <div className="bg-[var(--brand)] text-white p-8 mb-6">
        <p className="text-white/50 text-xs uppercase tracking-[0.3em] mb-2">Order Number</p>
        <h1 className="font-display text-3xl tracking-widest mb-2">{order.order_number}</h1>
        <p className="text-white/50 text-sm">
          {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Status tracker */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="bg-white border border-[var(--border)] p-6 mb-6">
          <h3 className="font-semibold uppercase tracking-widest text-sm mb-6">Status Pesanan</h3>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--border)]" />
            <div className="absolute top-5 left-0 h-0.5 bg-[var(--brand)] transition-all"
              style={{ width: `${Math.max(0, currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
            {STATUS_STEPS.map((s, i) => {
              const Icon = STATUS_ICONS[s] || Clock;
              const done = i <= currentStep;
              return (
                <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${done ? 'bg-[var(--brand)] border-[var(--brand)]' : 'bg-white border-[var(--border)]'}`}>
                    <Icon size={16} className={done ? 'text-white' : 'text-[var(--text-muted)]'} />
                  </div>
                  <span className={`text-[10px] text-center uppercase tracking-wide hidden sm:block ${done ? 'text-[var(--brand)] font-semibold' : 'text-[var(--text-muted)]'}`}>
                    {STATUS_LABELS[s]?.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-center mt-4 font-semibold text-sm">{STATUS_LABELS[order.status]}</p>
          {order.tracking_number && (
            <p className="text-center text-xs text-[var(--text-muted)] mt-1">
              No. Resi: <span className="font-mono font-semibold text-[var(--brand)]">{order.tracking_number}</span>
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-[var(--border)] mb-6">
        <div className="p-5 border-b border-[var(--border)]">
          <h3 className="font-semibold uppercase tracking-widest text-sm">Produk Dipesan</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-5">
              {item.product_image && (
                <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                {item.variant && Object.keys(item.variant).length > 0 && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {Object.entries(item.variant).map(([k,v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
                <p className="text-sm text-[var(--text-muted)] mt-1">{fmt(item.price)} × {item.quantity}</p>
              </div>
              <p className="font-bold">{fmt(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Shipping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-[var(--border)] p-6">
          <h3 className="font-semibold uppercase tracking-widest text-sm mb-4">Pengiriman</h3>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{order.customer_phone}</p>
          <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{order.shipping_address}</p>
          <p className="text-sm text-[var(--text-muted)]">{order.shipping_city}, {order.shipping_province}</p>
          <p className="text-sm font-semibold mt-3 uppercase tracking-wide">
            {order.shipping_courier} {order.shipping_service}
          </p>
        </div>

        <div className="bg-white border border-[var(--border)] p-6">
          <h3 className="font-semibold uppercase tracking-widest text-sm mb-4">Rincian Pembayaran</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Ongkir</span><span>{fmt(order.shipping_cost)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Diskon</span><span>– {fmt(order.discount)}</span></div>}
            <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span>{fmt(order.total)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Status Bayar</span>
              <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/products" className="btn-primary flex-1 py-4 text-center">
          Lanjut Belanja
        </Link>
        {customer && (
          <Link href="/account" className="btn-outline flex-1 py-4 text-center">
            Riwayat Order
          </Link>
        )}
      </div>
    </div>
  );
}
