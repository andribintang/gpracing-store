'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { getCart, updateCartItem, removeCartItem } from '@/lib/api';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function CartPage() {
  const { items, subtotal, setCart, setLoading, loading } = useCartStore();
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getCart().then(r => {
      const d = r.data.data;
      setCart(d.items || [], d.subtotal || 0);
    }).finally(() => setLoading(false));
  }, []);

  const handleQty = async (id: number, qty: number) => {
    setUpdating(id);
    try {
      await updateCartItem(id, qty);
      const r = await getCart();
      setCart(r.data.data.items, r.data.data.subtotal);
    } catch { toast.error('Gagal update'); }
    finally { setUpdating(null); }
  };

  const handleRemove = async (id: number) => {
    setUpdating(id);
    try {
      await removeCartItem(id);
      const r = await getCart();
      setCart(r.data.data.items, r.data.data.subtotal);
      toast.success('Item dihapus');
    } catch { toast.error('Gagal menghapus'); }
    finally { setUpdating(null); }
  };

  if (loading) return (
    <div className="container py-20 text-center">
      <div className="w-12 h-12 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', color: 'var(--brand)' }}>KERANJANG</h1>
        <p className="text-[var(--text-muted)]">{items.length} item</p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center border border-[var(--border)]">
          <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-display text-3xl text-gray-300 mb-2">KOSONG</p>
          <p className="text-[var(--text-muted)] mb-8">Belum ada produk di keranjangmu</p>
          <Link href="/products" className="btn-primary">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-1">
            {items.map((item: any) => (
              <div key={item.id} className="bg-white border border-[var(--border)] p-5 flex gap-5">
                {/* Image */}
                <Link href={`/products/${item.product?.slug}`} className="relative w-24 h-24 flex-shrink-0 bg-gray-50">
                  {item.product?.images?.[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="96px" />
                  ) : <ShoppingBag size={24} className="absolute inset-0 m-auto text-gray-300" />}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product?.slug}`} className="font-medium hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {item.product?.name || 'Produk'}
                  </Link>
                  {item.variant && Object.keys(item.variant).length > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wide">
                      {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                  <p className="font-bold mt-2">{fmt(item.price)}</p>
                </div>

                {/* Qty + Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => handleRemove(item.id)} disabled={updating === item.id}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center border border-[var(--border)]">
                    <button onClick={() => handleQty(item.id, item.quantity - 1)}
                      disabled={updating === item.id || item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
                      <Minus size={12} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{updating === item.id ? '…' : item.quantity}</span>
                    <button onClick={() => handleQty(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-bold">{fmt(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--brand)] text-white p-8 sticky top-24">
              <h2 className="font-display text-2xl tracking-widest mb-6">RINGKASAN</h2>
              <div className="space-y-3 mb-6 border-b border-white/10 pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal ({items.reduce((s: any, i: any) => s + i.quantity, 0)} item)</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Ongkir</span>
                  <span className="text-xs uppercase tracking-wide">Dihitung di checkout</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg mb-8">
                <span>Total</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <Link href="/checkout" className="btn-accent w-full py-4 flex items-center justify-center gap-3 text-base">
                Checkout <ArrowRight size={18} />
              </Link>
              <Link href="/products" className="block text-center text-sm text-white/50 mt-4 hover:text-white transition-colors uppercase tracking-widest">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
