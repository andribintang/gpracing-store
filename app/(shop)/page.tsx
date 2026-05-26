import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoriesSection from '@/components/home/CategoriesSection';
import BrandStatement from '@/components/home/BrandStatement';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <BrandStatement />
      <Suspense fallback={<div className="py-20 text-center text-[var(--text-muted)]">Memuat produk...</div>}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
