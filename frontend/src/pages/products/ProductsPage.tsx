import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageOpen } from "lucide-react";

import ProductCard from "../../components/products/ProductCard";
import ProductFilters from "../../components/products/ProductFilters";
import Pagination from "../../components/common/Pagination";
import { ProductGridSkeleton } from "../../components/common/Skeleton";

import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { useCart } from "../../context/CartContext";
import { getApiError } from "../../utils/format";

import type { ProductList } from "../../types/product";
import type { CategoryList } from "../../types/category";

const PAGE_SIZE = 12;
// The API cannot filter by price or stock, so when those filters are on we load
// up to this many matches once and filter/paginate them in the browser.
const CLIENT_FETCH_SIZE = 100;

const SORT_OPTIONS = [
  { label: "Newest", sortBy: "id", sortDirection: "desc" },
  { label: "Price: low to high", sortBy: "price", sortDirection: "asc" },
  { label: "Price: high to low", sortBy: "price", sortDirection: "desc" },
  { label: "Name: A to Z", sortBy: "name", sortDirection: "asc" },
] as const;

export default function ProductsPage() {
  const { addItem } = useCart();

  // ---- all filter state lives in the URL, so links can be shared and Back works ----
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const categoryId = params.get("categoryId") ? Number(params.get("categoryId")) : undefined;
  const minPrice = params.get("min") ?? "";
  const maxPrice = params.get("max") ?? "";
  const inStock = params.get("stock") === "1";
  const sortIndex = Math.min(Math.max(Number(params.get("sort") ?? 0) || 0, 0), SORT_OPTIONS.length - 1);
  const page = Math.max(Number(params.get("page") ?? 1) || 1, 1);

  const update = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v) next.set(k, v);
            else next.delete(k);
          }
          if (resetPage) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  // the search box keeps its own text and only writes to the URL after a pause
  const [searchText, setSearchText] = useState(search);
  useEffect(() => setSearchText(search), [search]);
  const timer = useRef<number | undefined>(undefined);
  const onSearchChange = (value: string) => {
    setSearchText(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => update({ q: value.trim() || undefined }), 350);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // ---- data ----
  const clientMode = minPrice !== "" || maxPrice !== "" || inStock;

  const [categories, setCategories] = useState<CategoryList[]>([]);
  const [rows, setRows] = useState<ProductList[]>([]);
  const [serverPages, setServerPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const sort = SORT_OPTIONS[sortIndex];
        const result = await productService.getProducts({
          pageNumber: clientMode ? 1 : page,
          pageSize: clientMode ? CLIENT_FETCH_SIZE : PAGE_SIZE,
          sortBy: sort.sortBy,
          sortDirection: sort.sortDirection,
          search: search || undefined,
          categoryId,
        });
        if (cancelled) return;
        setRows(result.items);
        setServerPages(result.totalPages);
        setTotalCount(result.totalCount);
      } catch (e) {
        if (cancelled) return;
        setError(getApiError(e, "Unable to load products."));
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // price / stock are applied below, so typing a price does not refetch
  }, [search, categoryId, sortIndex, clientMode, clientMode ? 1 : page]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = useMemo(() => {
    if (!clientMode) return { items: rows, totalPages: serverPages, count: totalCount };
    const min = minPrice !== "" ? Number(minPrice) : -Infinity;
    const max = maxPrice !== "" ? Number(maxPrice) : Infinity;
    const filtered = rows.filter((p) => p.price >= min && p.price <= max && (!inStock || p.stockQuantity > 0));
    const pages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
    const start = (Math.min(page, pages) - 1) * PAGE_SIZE;
    return { items: filtered.slice(start, start + PAGE_SIZE), totalPages: pages, count: filtered.length };
  }, [clientMode, rows, serverPages, totalCount, minPrice, maxPrice, inStock, page]);

  const currentPage = Math.min(page, view.totalPages);

  const handleAddToCart = async (productId: number) => {
    try {
      setNotice("");
      setError("");
      await addItem(productId, 1);
      setNotice("Added to your cart.");
      window.setTimeout(() => setNotice(""), 2500);
    } catch (e) {
      setError(getApiError(e, "Unable to add the product to your cart."));
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setParams({}, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Our collection</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Products</h1>
        <p className="mt-3 max-w-2xl text-slate-500">Browse our collection and find something you love.</p>
      </div>

      <ProductFilters
        search={searchText}
        categoryId={categoryId}
        categories={categories}
        minPrice={minPrice}
        maxPrice={maxPrice}
        inStock={inStock}
        onSearchChange={onSearchChange}
        onCategoryChange={(v) => update({ categoryId: v ? String(v) : undefined })}
        onMinChange={(v) => update({ min: v || undefined })}
        onMaxChange={(v) => update({ max: v || undefined })}
        onInStockChange={(v) => update({ stock: v ? "1" : undefined })}
        onClear={clearFilters}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500" aria-live="polite">
          {loading ? "Loading..." : `${view.count} product${view.count === 1 ? "" : "s"}`}
          {clientMode && totalCount > CLIENT_FETCH_SIZE && !loading && ` (filtering the first ${CLIENT_FETCH_SIZE} matches)`}
        </p>
        <select
          value={sortIndex}
          onChange={(e) => update({ sort: Number(e.target.value) ? e.target.value : undefined })}
          aria-label="Sort products"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900"
        >
          {SORT_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
        </select>
      </div>

      {notice && <div className="fade-in mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-800">{notice}</div>}
      {error && <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : view.items.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <PackageOpen size={42} className="text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No products found</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">Try changing your search, price range or category.</p>
          {params.size > 0 && (
            <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="fade-in grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {view.items.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={view.totalPages}
            hasPreviousPage={currentPage > 1}
            hasNextPage={currentPage < view.totalPages}
            onPageChange={(p) => update({ page: p > 1 ? String(p) : undefined }, false)}
          />
        </>
      )}
    </div>
  );
}
