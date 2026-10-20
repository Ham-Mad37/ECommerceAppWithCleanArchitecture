import { useEffect, useState } from "react";
import { categoryService } from "../services/categoryService";
import { Link } from "react-router-dom";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await categoryService.getCategories();
        if (mounted) setCategories(c ?? []);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <div className="flex flex-wrap gap-3">
        {categories.map(c => (
          <Link key={c.id} to={`/products?categoryId=${c.id}`} className="rounded border px-3 py-2 bg-white text-sm">{c.name}</Link>
        ))}
      </div>
    </div>
  );
}
