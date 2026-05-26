'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { addToCart, getCart } from '@/lib/api';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';

interface Product {
  id: number; name: string; slug: string; price: number;
  price_compare?: number; images: string[]; is_featured?: boolean;
  sold_count?: number; stock: number; category?: { name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false);
  const { setCart } = useCartStore();
  const isOnSale = product.price_compare && product.price_compare > product.price;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (adding || product.stock === 0) return;
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, brand: 'gpracing', quantity: 1 });
      const cart = await getCart();
      setCart(cart.data.data.items, cart.data.data.subtotal);
      toast.success('Ditambahkan ke keranjang');
    } catch { toast.error('Gagal menambahkan'); }
    finally { setAdding(false); }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <Link href={`/products/${product.slug}`} className="group block relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--brand)] transition-colors">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--bg-elevated)]">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag size={32} className="text-[var(--border-light)]" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOnSale && <span className="badge-sale">Sale</span>}
          {product.is_featured && !isOnSale && <span className="badge-new">Hot</span>}
          {product.stock === 0 && <span className="bg-[var(--border-light)] text-[var(--text-muted)] text-[11px] font-bold px-2 py-0.5 uppercase font-display">Habis</span>}
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleQuickAdd} disabled={adding || product.stock === 0}
            className="w-full py-3 bg-[var(--brand)] text-white font-display font-700 text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-60">
            <Zap size={14} fill="white" />
            {adding ? 'Adding...' : product.stock === 0 ? 'Habis' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <p className="font-display font-600 text-[10px] text-[var(--brand)] uppercase tracking-[0.2em] mb-1">{product.category.name}</p>
        )}
        <h3 className="text-sm font-medium leading-snug mb-2 text-[var(--text)] group-hover:text-[var(--brand)] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {isOnSale ? (
            <>
              <span className="price-sale">{fmt(product.price)}</span>
              <span className="price-old">{fmt(product.price_compare!)}</span>
            </>
          ) : (
            <span className="price">{fmt(product.price)}</span>
          )}
        </div>
        {product.sold_count! > 0 && (
          <p className="font-mono text-[10px] text-[var(--text-dim)] mt-1">{product.sold_count}x terjual</p>
        )}
      </div>
    </Link>
  );
}
