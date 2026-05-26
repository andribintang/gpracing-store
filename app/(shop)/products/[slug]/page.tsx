'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, ChevronRight, Star, Truck, Shield, RotateCcw, Minus, Plus } from 'lucide-react';
import { getProduct, addToCart, getCart } from '@/lib/api';
import { useCartStore } from '@/store';
import toast from 'react-hot-toast';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product,     setProduct]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [imgIdx,      setImgIdx]      = useState(0);
  const [quantity,    setQuantity]    = useState(1);
  const [variant,     setVariant]     = useState<Record<string, string>>({});
  const [adding,      setAdding]      = useState(false);
  const { setCart } = useCartStore();

  useEffect(() => {
    getProduct(params.slug).then(r => {
      setProduct(r.data.data.product);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!product || adding) return;
    // Check all variants selected
    const variantKeys = Object.keys(product.variants || {});
    for (const k of variantKeys) {
      if (!variant[k]) { toast.error(`Pilih ${k} terlebih dahulu`); return; }
    }
    setAdding(true);
    try {
      await addToCart({ product_id: product.id, brand: 'gpracing', quantity, variant });
      const cart = await getCart();
      setCart(cart.data.data.items, cart.data.data.subtotal);
      toast.success('Ditambahkan ke keranjang!');
    } catch { toast.error('Gagal menambahkan'); }
    finally { setAdding(false); }
  };

  if (loading) return (
    <div className="container py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 animate-pulse" />
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container py-20 text-center">
      <p className="font-display text-5xl text-gray-200 mb-4">404</p>
      <p className="text-[var(--text-muted)] mb-6">Produk tidak ditemukan</p>
      <Link href="/products" className="btn-primary">Kembali ke Produk</Link>
    </div>
  );

  const images = product.images?.length ? product.images : [null];
  const isOnSale = product.price_compare && product.price_compare > product.price;
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div className="container py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] uppercase tracking-widest mb-8">
        <Link href="/" className="hover:text-[var(--brand)]">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[var(--brand)]">Produk</Link>
        {product.category && <><span>/</span><span>{product.category.name}</span></>}
        <span>/</span>
        <span className="text-[var(--brand)] truncate max-w-40">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div>
          {/* Main image */}
          <div className="relative aspect-square bg-gray-100 overflow-hidden mb-3">
            {images[imgIdx] ? (
              <Image src={images[imgIdx]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={48} className="text-gray-300" /></div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(v => (v - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setImgIdx(v => (v + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`relative flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-[var(--brand)]' : 'border-transparent'}`}>
                  {img && <Image src={img} alt="" fill className="object-cover" sizes="80px" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-semibold leading-tight mb-4">{product.name}</h1>

          {/* Rating */}
          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} fill={i <= Number(avgRating) ? '#e63946' : 'none'} className="text-[var(--accent)]" />
                ))}
              </div>
              <span className="text-sm text-[var(--text-muted)]">{avgRating} ({product.reviews?.length} ulasan)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            {isOnSale ? (
              <>
                <span className="text-3xl font-bold text-[var(--accent)]">{formatPrice(product.price)}</span>
                <span className="text-lg text-[var(--text-muted)] line-through">{formatPrice(product.price_compare)}</span>
                <span className="badge-sale">{Math.round((1 - product.price / product.price_compare) * 100)}% OFF</span>
              </>
            ) : (
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className="text-sm text-[var(--text-muted)]">
              {product.stock > 10 ? 'Stok tersedia' : product.stock > 0 ? `Sisa ${product.stock} item` : 'Stok habis'}
            </span>
          </div>

          {/* Variants */}
          {product.variants && Object.entries(product.variants as Record<string, string[]>).map(([key, values]) => (
            <div key={key} className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3">{key}</p>
              <div className="flex flex-wrap gap-2">
                {(values as string[]).map((v: string) => (
                  <button key={v} onClick={() => setVariant(prev => ({ ...prev, [key]: v }))}
                    className={`px-4 py-2 text-sm border-2 transition-colors uppercase tracking-wide ${variant[key] === v ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-[var(--border)] hover:border-[var(--brand)]'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3">Jumlah</p>
            <div className="inline-flex items-center border-2 border-[var(--border)]">
              <button onClick={() => setQuantity(v => Math.max(1, v - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"><Minus size={16} /></button>
              <span className="w-16 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(v => Math.min(product.stock, v + 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"><Plus size={16} /></button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
              className="btn-primary flex-1 py-4 text-base disabled:opacity-50 flex items-center justify-center gap-3">
              <ShoppingBag size={20} />
              {adding ? 'Menambahkan...' : product.stock === 0 ? 'Stok Habis' : 'Add to Cart'}
            </button>
            <Link href="/cart" onClick={handleAddToCart}
              className="btn-accent flex-1 py-4 text-base flex items-center justify-center text-center">
              Beli Sekarang
            </Link>
          </div>

          {/* Guarantees */}
          <div className="border border-[var(--border)] divide-y divide-[var(--border)]">
            {[
              { icon: Truck,    text: 'Gratis ongkir min. Rp 150.000' },
              { icon: Shield,   text: 'Jaminan produk original & berkualitas' },
              { icon: RotateCcw,text: 'Retur mudah dalam 7 hari' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 px-4 py-3">
                <Icon size={18} className="text-[var(--text-muted)] flex-shrink-0" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h3 className="font-semibold uppercase tracking-widest text-sm mb-4">Deskripsi</h3>
              <div className="text-sm text-[var(--text-muted)] leading-relaxed prose prose-sm"
                dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-20 border-t border-[var(--border)] pt-16">
          <h2 className="section-title mb-10">ULASAN</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.reviews.map((r: any) => (
              <div key={r.id} className="bg-white border border-[var(--border)] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-[var(--brand)] text-white flex items-center justify-center text-sm font-bold">
                    {r.customer_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.customer_name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= r.rating ? '#e63946' : 'none'} className="text-[var(--accent)]" />)}
                    </div>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
