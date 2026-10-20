import { Search, X } from "lucide-react";

import type { CategoryList } from "../../types/category";

interface ProductFiltersProps {
  search: string;
  categoryId?: number;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  categories: CategoryList[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value?: number) => void;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onInStockChange: (value: boolean) => void;
  onClear: () => void;
}

const field =
  "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10";

export default function ProductFilters(p: ProductFiltersProps) {
  const hasFilters =
    p.search.trim() !== "" || p.categoryId !== undefined || p.minPrice !== "" || p.maxPrice !== "" || p.inStock;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={p.search}
            onChange={(e) => p.onSearchChange(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className={`${field} w-full pl-10`}
          />
        </div>

        <select
          value={p.categoryId ?? ""}
          onChange={(e) => p.onCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
          aria-label="Category"
          className={`${field} lg:w-56`}
        >
          <option value="">All categories</option>
          {p.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Price</span>
        <input type="number" min={0} inputMode="decimal" value={p.minPrice} onChange={(e) => p.onMinChange(e.target.value)} placeholder="Min" aria-label="Minimum price" className={`${field} w-28 py-2`} />
        <span className="text-slate-400">–</span>
        <input type="number" min={0} inputMode="decimal" value={p.maxPrice} onChange={(e) => p.onMaxChange(e.target.value)} placeholder="Max" aria-label="Maximum price" className={`${field} w-28 py-2`} />

        <label className="ml-1 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
          <input type="checkbox" checked={p.inStock} onChange={(e) => p.onInStockChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-slate-900" />
          In stock only
        </label>

        {hasFilters && (
          <button type="button" onClick={p.onClear} className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            <X size={16} /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}
