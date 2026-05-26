import Link from 'next/link';
import { MessageCircle, Mail, MapPin, Phone, Zap } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border)] mt-20">
      {/* Red stripe */}
      <div className="h-1 bg-[var(--brand)]" />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-[var(--brand)] flex items-center justify-center flex-shrink-0">
                <Zap size={16} fill="white" className="text-white" />
              </div>
              <div>
                <span className="font-display font-900 text-2xl tracking-widest text-white block leading-none">GP RACING</span>
                <span className="text-[9px] tracking-[0.4em] text-[var(--text-muted)] uppercase block">STORE</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              Spare part motor racing berkualitas. Original & terpercaya untuk performa terbaik.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://instagram.com/gpracingstore', icon: <InstagramIcon /> },
                { href: 'https://wa.me/6281234567890',         icon: <MessageCircle size={16} /> },
                { href: 'mailto:info@gpracingstore.com',       icon: <Mail size={16} /> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  className="w-10 h-10 border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="font-display font-700 text-sm tracking-widest uppercase text-[var(--text-muted)] mb-5">Kategori</h4>
            <ul className="space-y-3">
              {[
                { label: 'Part Mesin',        href: '/products?category=mesin' },
                { label: 'Suspensi & Rem',    href: '/products?category=suspensi' },
                { label: 'Body & Fairing',    href: '/products?category=body-aksesoris' },
                { label: 'Knalpot Racing',    href: '/products?category=knalpot' },
                { label: 'Velg & Ban',        href: '/products?category=velg-ban' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors uppercase tracking-wide font-display">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display font-700 text-sm tracking-widest uppercase text-[var(--text-muted)] mb-5">Info</h4>
            <ul className="space-y-3">
              {[
                { label: 'Tentang Kami',      href: '/about' },
                { label: 'Cara Order',        href: '/how-to-order' },
                { label: 'Cek Kompatibilitas',href: '/compatibility' },
                { label: 'Garansi & Retur',   href: '/return-policy' },
                { label: 'Privasi',           href: '/privacy' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors uppercase tracking-wide font-display">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-display font-700 text-sm tracking-widest uppercase text-[var(--text-muted)] mb-5">Kontak</h4>
            <ul className="space-y-3">
              {[
                { icon: <MapPin size={15} />,  text: 'Jl. Racing No. 99, Kota' },
                { icon: <Phone size={15} />,   text: '+62 812-3456-7890' },
                { icon: <Mail size={15} />,    text: 'info@gpracingstore.com' },
              ].map((c, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)]">
                  <span className="flex-shrink-0 mt-0.5 text-[var(--brand)]">{c.icon}</span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-xs text-[var(--text-dim)] uppercase tracking-widest mb-3 font-display">Pembayaran</p>
              <div className="flex gap-2 flex-wrap">
                {['BCA', 'Mandiri', 'BNI', 'QRIS', 'GoPay', 'OVO'].map(p => (
                  <span key={p} className="text-xs border border-[var(--border)] px-2 py-1 text-[var(--text-dim)] font-mono">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-dim)]">© 2025 GP RACING STORE. All rights reserved.</p>
          <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-display">Powered by GPDISTRO System</p>
        </div>
      </div>
    </footer>
  );
}
