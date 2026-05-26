'use client';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

const slides = [
  {
    tag: 'New Arrival',
    title: ['PERFORMA', 'TANPA', 'KOMPROMI'],
    accent: [false, false, true],
    sub: 'Spare part motor racing original & berkualitas tinggi',
    cta: 'Shop Now', href: '/products',
  },
  {
    tag: 'Best Seller',
    title: ['UPGRADE', 'YOUR', 'RIDE'],
    accent: [false, true, false],
    sub: 'Ribuan pilihan part untuk semua jenis motor',
    cta: 'Lihat Semua', href: '/products',
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [tick,   setTick]   = useState(0);

  useEffect(() => {
    const t = setInterval(() => { setActive(v => (v + 1) % slides.length); setTick(v => v + 1); }, 5500);
    return () => clearInterval(t);
  }, []);

  const slide = slides[active];

  return (
    <section className="relative bg-[var(--bg)] overflow-hidden noise-overlay" style={{ minHeight: '92vh' }}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 60px,#fff 60px,#fff 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#fff 60px,#fff 61px)' }} />

      {/* Red glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)' }} />

      {/* Diagonal slash decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 hidden lg:block"
        style={{ background: 'linear-gradient(135deg, transparent 40%, var(--brand) 40%, var(--brand) 45%, transparent 45%)' }} />

      <div className="container relative flex items-center py-20 min-h-[92vh]">
        <div className="max-w-4xl">
          {/* Tag */}
          <div key={tick} className="inline-flex items-center gap-2 bg-[var(--brand)] px-4 py-2 mb-10 animate-race-in">
            <Zap size={14} fill="white" className="text-white" />
            <span className="font-display font-700 text-xs tracking-[0.3em] text-white uppercase">{slide.tag}</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-900 text-white leading-none mb-8"
            style={{ fontSize: 'clamp(5rem, 16vw, 14rem)' }}>
            {slide.title.map((line, i) => (
              <span key={`${tick}-${i}`} className={`block animate-race-in ${slide.accent[i] ? 'text-[var(--brand)]' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}>
                {line}
              </span>
            ))}
          </h1>

          <p className="text-[var(--text-muted)] text-lg mb-10 max-w-md animate-fade-up" style={{ animationDelay: '200ms' }}>
            {slide.sub}
          </p>

          <div className="flex gap-4 flex-wrap animate-fade-up" style={{ animationDelay: '280ms' }}>
            <Link href={slide.href} className="btn-primary inline-flex items-center gap-3 text-base">
              {slide.cta} <ArrowRight size={18} />
            </Link>
            <Link href="/products?featured=true" className="btn-outline text-base">
              Best Seller
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-14 animate-fade-up" style={{ animationDelay: '360ms' }}>
            {[
              { icon: <Shield size={16} />,  text: 'Part Original' },
              { icon: <Zap size={16} />,     text: 'Stok Lengkap' },
              { icon: <Truck size={16} />,   text: 'Same Day Kirim' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="text-[var(--brand)]">{b.icon}</span>
                <span className="font-display font-600 tracking-widest uppercase text-xs">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`h-1 transition-all ${i === active ? 'w-10 bg-[var(--brand)]' : 'w-4 bg-[var(--border-light)]'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
