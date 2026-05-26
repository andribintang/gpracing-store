'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { getCategories, getFeatured } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// ── Categories ────────────────────────────────────────────────
export function CategoriesSection() {
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    getCategories().then(r => setCats(r.data.data.categories || [])).catch(() => {});
  }, []);

  const fallback = [
    { id:1, name:'Mesin & Karburator', slug:'mesin',          description:'Piston, klep, karburator, injeksi' },
    { id:2, name:'Suspensi & Rem',     slug:'suspensi',       description:'Shock, kampas rem, cakram, kaliper' },
    { id:3, name:'Knalpot Racing',     slug:'knalpot',        description:'Full system, slip-on, header pipe' },
    { id:4, name:'Body & Fairing',     slug:'body-aksesoris', description:'Fairing, spakbor, aksesoris' },
    { id:5, name:'Velg & Ban',         slug:'velg-ban',       description:'Velg racing, ban slick, ban road' },
    { id:6, name:'Elektrikal',         slug:'elektrikal',     description:'CDI, koil, speedometer, lampu' },
  ];
  const display = cats.length ? cats : fallback;

  return (
    <section className="py-20 container">
      <div className="flex items-end justify-between mb-10">
        <h2 className="section-title">KATEGORI<br /><span className="text-[var(--brand)]">PART</span></h2>
        <Link href="/products" className="font-display font-700 text-sm uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors flex items-center gap-2">
          Semua <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        {display.slice(0, 6).map((cat, i) => (
          <Link key={cat.id} href={`/products?category=${cat.slug}`}
            className="group relative bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--brand)] transition-colors p-6 flex flex-col">
            {/* Number */}
            <span className="font-mono text-5xl font-bold text-[var(--border)] group-hover:text-[var(--brand)]/20 transition-colors mb-4 block">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display font-700 text-sm uppercase tracking-wide leading-tight mb-2 group-hover:text-[var(--brand)] transition-colors">
              {cat.name}
            </h3>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed mt-auto">{cat.description}</p>
            <div className="mt-4 w-6 h-0.5 bg-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Brand Statement ───────────────────────────────────────────
export function BrandStatement() {
  return (
    <section className="bg-[var(--brand)] py-20 relative overflow-hidden">
      {/* Diagonal bg element */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(0,0,0,0.3) 20px, rgba(0,0,0,0.3) 21px)' }} />

      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-display font-700 text-xs tracking-[0.5em] text-white/50 uppercase mb-6">Why GP Racing</p>
            <h2 className="font-display font-900 text-white leading-tight mb-8"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
              PART YANG TEPAT<br />
              <span className="text-[var(--accent)]">PERFORMA</span><br />
              YANG NYATA
            </h2>
            <p className="text-white/60 text-lg max-w-md leading-relaxed">
              Kami hanya jual produk original dan bergaransi. Setiap part dikurasi untuk memastikan kompatibilitas dan performa terbaik motormu.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-1">
            {[
              { n: '10.000+', l: 'SKU Tersedia',    sub: 'Part lengkap' },
              { n: '100%',    l: 'Original',         sub: 'Garansi resmi' },
              { n: '3.000+',  l: 'Pelanggan',        sub: 'Aktif berbelanja' },
              { n: '24 Jam',  l: 'Proses Order',     sub: 'Weekday' },
            ].map(s => (
              <div key={s.l} className="bg-black/20 p-6">
                <p className="font-display font-900 text-[var(--accent)] leading-none mb-1"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{s.n}</p>
                <p className="font-display font-700 text-white text-sm uppercase tracking-widest">{s.l}</p>
                <p className="text-white/40 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Featured Products ─────────────────────────────────────────
export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getFeatured().then(r => setProducts(r.data.data.products || [])).catch(() => {});
  }, []);

  if (!products.length) return null;

  return (
    <section className="py-20">
      <div className="container mb-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Zap size={20} fill="var(--brand)" className="text-[var(--brand)]" />
              <span className="font-display font-700 text-xs tracking-[0.4em] text-[var(--brand)] uppercase">Hot Items</span>
            </div>
            <h2 className="section-title">PRODUK<br /><span className="text-[var(--brand)]">TERLARIS</span></h2>
          </div>
          <Link href="/products" className="font-display font-700 text-sm uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors flex items-center gap-2">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="product-grid stagger">
        {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
