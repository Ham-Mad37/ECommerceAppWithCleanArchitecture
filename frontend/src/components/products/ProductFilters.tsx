import { Search, X } from "lucide-react";

import type { CategoryList } from "../../types/category";

interface ProductFiltersProps {
  search: string;
  categoryId?: number;
  categories: CategoryList[];
  onSearchChange: (
    value: string
  ) => void;
  onCategoryChange: (
    value?: number
  ) => void;
  onClear: () => void;
}

export default function ProductFilters({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
  onClear,
}: ProductFiltersProps) {
  const hasFilters =
    search.trim() !== "" ||
    categoryId !== undefined;

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="flex flex-col gap-4 lg:flex-row">

        {/* Search */}

        <div className="relative flex-1">

          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          />

        </div>

        {/* Category */}

        <select
          value={categoryId ?? ""}
          onChange={(event) => {
            const value =
              event.target.value;

            onCategoryChange(
              value
                ? Number(value)
                : undefined
            );
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 lg:w-56"
        >
          <option value="">
            All categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          )}
        </select>

        {/* Clear */}

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <X size={17} />
            Clear
          </button>
        )}

      </div>
    </div>
  );
}