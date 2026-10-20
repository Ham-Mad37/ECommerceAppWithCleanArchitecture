import { useEffect, useState } from "react";
import Hero from "../components/common/Hero";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import ProductCard from "../components/products/ProductCard";
import { ProductGridSkeleton } from "../components/common/Skeleton";

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const p = await productService.getProducts({ pageNumber: 1, pageSize: 8 });
        const c = await categoryService.getCategories();
        if (mounted) {
          setFeatured(p.items ?? []);
          setCategories(c ?? []);
        }
      } catch (err) {
        setFeatured([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-8">
      <Hero title="Welcome to Our Store" subtitle="Quality products curated for you." ctaText="Shop Now" ctaHref="/products" />

      <div className="max-w-7xl mx-auto px-4">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : featured.length === 0 ? (
            <div>No featured products found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c: any) => (
              <a key={c.id} href={`/products?categoryId=${c.id}`} className="rounded border px-3 py-2 bg-white text-sm">{c.name}</a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
