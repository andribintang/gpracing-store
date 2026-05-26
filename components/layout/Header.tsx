'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag, Search, User, Menu, X, Zap } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/store';
import { getCart } from '@/lib/api';

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { count, setCart } = useCartStore();
  const { customer } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getCart().then(r => {
      const d = r.data.data;
      setCart(d.items || [], d.subtotal || 0);
    }).catch(() => {});
  }, [setCart]);

  const navLinks = [
    { label: 'Semua Part', href: '/products' },
    { label: 'Mesin',      href: '/products?category=mesin' },
    { label: 'Suspensi',   href: '/products?category=suspensi' },
    { label: 'Body & Aksesoris', href: '/products?category=body-aksesoris' },
    { label: 'Promo',      href: '/products?featured=true' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[var(--bg-card)] border-b border-[var(--border)] shadow-lg shadow-black/20' : 'bg-[var(--bg)]'}`}>
        {/* Top bar */}
        <div className="bg-[var(--brand)] text-white text-center py-2 text-xs tracking-widest uppercase font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          ⚡ Gratis Ongkir min. Rp 200.000 · Garansi Produk Original · Pengiriman Same Day
        </div>

        <div className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--brand)] flex items-center justify-center">
                <Zap size={18} fill="white" className="text-white" />
              </div>
              <div>
                <span className="font-display font-900 text-2xl tracking-widest text-white block leading-none">GP RACING</span>
                <span className="text-[9px] tracking-[0.4em] text-[var(--text-muted)] uppercase block leading-none">STORE</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className="font-display font-600 text-sm tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(v => !v)}
                className="p-2 hover:text-[var(--brand)] transition-colors">
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
              <Link href={customer ? '/account' : '/login'}
                className="p-2 hover:text-[var(--brand)] transition-colors hidden sm:block">
                <User size={20} />
              </Link>
              <Link href="/cart" className="relative p-2 hover:text-[var(--brand)] transition-colors">
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--brand)] text-white text-[10px] font-bold flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden p-2">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-4 animate-fade-in">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery) window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`; }}
                className="flex gap-2">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari spare part, merek, tipe motor..."
                  className="input flex-1" autoFocus />
                <button type="submit" className="btn-primary px-6">Cari</button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-[var(--bg-card)] border-t border-[var(--border)] animate-fade-in">
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 font-display font-600 text-sm tracking-widest uppercase border-b border-[var(--border)] last:border-0 text-[var(--text-muted)] hover:text-[var(--brand)]">
                  {l.label}
                </Link>
              ))}
              <Link href={customer ? '/account' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="py-3 font-display font-600 text-sm tracking-widest uppercase flex items-center gap-2 text-[var(--text-muted)]">
                <User size={16} /> {customer ? customer.name : 'Login / Daftar'}
              </Link>
            </div>
          </div>
        )}
      </header>
      <div className="h-[calc(32px+64px)]" />
    </>
  );
}
