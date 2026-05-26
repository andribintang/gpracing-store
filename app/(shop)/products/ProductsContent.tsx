'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { getProducts, getCategories } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru' },
  { value: 'popular',   label: 'Terlaris' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc',label: 'Harga: Tinggi ke Rendah' },
];

export default function ProductsContent() {
  const searchParams = useSearchParams();

  const [products,   setProducts]   = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [sort,     setSort]     = useState(searchParams.get('sort')     || 'newest');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search,   setSearch]   = useState(searchParams.get('search')   || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price')|| '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price')|| '');

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.data.categories || [])).catch(() => {});
  }, []);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { sort, page: p, limit: 24 };
      if (category)  params.category  = category;
      if (search)    params.search    = search;
      if (minPrice)  params.min_price = minPrice;
      if (maxPrice)  params.max_price = maxPrice;
      const r = await getProducts(params);
      const d = r.data.data;
      setProducts(p === 1 ? d.products : (prev: any[]) => [...prev, ...d.products]);
      setTotal(d.total);
      setTotalPages(d.total_pages);
      setPage(p);
    } catch { } finally { setLoading(false); }
  }, [sort, category, search, minPrice, maxPrice]);

  useEffect(() => { load(1); }, [load]);

  const clearFilters = () => { setCategory(''); setSearch(''); setMinPrice(''); setMaxPrice(''); setSort('newest'); };
  const hasFilters   = category || search || minPrice || maxPrice;

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="bg-[var(--brand)] py-12">
        <div className="container">
          <h1 className="font-display text-white" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>
            {category
              ? categories.find(c => c.slug === category)?.name || 'PRODUK'
              : search ? `"${search}"` : 'ALL PRODUCTS'}
          </h1>
          <p className="text-white/50 mt-2">{total} produk ditemukan</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setFilterOpen(v => !v)}
              className="btn-outline py-2.5 px-4 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filter
            </button>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
                <X size={14} /> Reset
              </button>
            )}
          </div>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="input py-2.5 pr-8 appearance-none cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="bg-white border border-[var(--border)] p-6 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-3">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setCategory('')}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wide border transition-colors ${!category ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'border-[var(--border)] hover:border-[var(--brand)]'}`}>
                    Semua
                  </button>
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setCategory(c.slug)}
                      className={`px-3 py-1.5 text-xs uppercase tracking-wide border transition-colors ${category === c.slug ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'border-[var(--border)] hover:border-[var(--brand)]'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-3">Harga (Rp)</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="input py-2 text-sm" />
                  <span className="text-[var(--text-muted)]">–</span>
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-3">Cari Produk</label>
                <input type="text" placeholder="Nama produk..." value={search}
                  onChange={e => setSearch(e.target.value)} className="input py-2 text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Active chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {category && (
              <span className="flex items-center gap-1 bg-[var(--brand)] text-white text-xs px-3 py-1.5 uppercase tracking-wide">
                {categories.find(c => c.slug === category)?.name}
                <button onClick={() => setCategory('')}><X size={12} /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 bg-[var(--brand)] text-white text-xs px-3 py-1.5">
                "{search}" <button onClick={() => setSearch('')}><X size={12} /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="flex items-center gap-1 bg-[var(--brand)] text-white text-xs px-3 py-1.5">
                {minPrice ? fmt(Number(minPrice)) : '...'} – {maxPrice ? fmt(Number(maxPrice)) : '...'}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading && products.length === 0 ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white">
                <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-5xl text-gray-200 mb-4">KOSONG</p>
            <p className="text-[var(--text-muted)]">Tidak ada produk yang ditemukan</p>
            <button onClick={clearFilters} className="btn-primary mt-6">Reset Filter</button>
          </div>
        ) : (
          <>
            <div className="product-grid stagger">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {page < totalPages && (
              <div className="text-center mt-12">
                <button onClick={() => load(page + 1)} disabled={loading}
                  className="btn-outline px-12 py-4 disabled:opacity-50">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
