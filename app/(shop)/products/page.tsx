import { Suspense } from 'react';
import ProductsContent from './ProductsContent';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center text-[var(--text-muted)]">Memuat produk...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
