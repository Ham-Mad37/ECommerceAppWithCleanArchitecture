import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  PackageOpen,
} from "lucide-react";

import ProductCard from "../../components/products/ProductCard";
import ProductFilters from "../../components/products/ProductFilters";
import Pagination from "../../components/common/Pagination";

import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";

import type {
  ProductList,
} from "../../types/product";

import type {
  CategoryList,
} from "../../types/category";

export default function ProductsPage() {
  const [
    products,
    setProducts,
  ] = useState<ProductList[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<CategoryList[]>([]);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    hasPreviousPage,
    setHasPreviousPage,
  ] = useState(false);

  const [
    hasNextPage,
    setHasNextPage,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    categoryId,
    setCategoryId,
  ] = useState<number | undefined>();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const pageSize = 12;

  const loadCategories =
    useCallback(async () => {
      try {
        const data =
          await categoryService.getCategories();

        setCategories(data);
      } catch {
        // Categories are optional for displaying products.
        setCategories([]);
      }
    }, []);

  const loadProducts =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await productService.getProducts({
            page,
            pageSize,
            search:
              search.trim() || undefined,
            categoryId,
          });

        setProducts(
          result.items
        );

        setTotalPages(
          result.totalPages
        );

        setHasPreviousPage(
          result.hasPreviousPage
        );

        setHasNextPage(
          result.hasNextPage
        );
      } catch (error: any) {
        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          "Unable to load products.";

        setError(message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      categoryId,
    ]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (
    value?: number
  ) => {
    setCategoryId(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

      {/* Header */}

      <div className="mb-8">

        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Our collection
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Products
        </h1>

        <p className="mt-3 max-w-2xl text-slate-500">
          Browse our collection and find something you love.
        </p>

      </div>

      {/* Filters */}

      <ProductFilters
        search={search}
        categoryId={categoryId}
        categories={categories}
        onSearchChange={handleSearch}
        onCategoryChange={handleCategory}
        onClear={clearFilters}
      />

      {/* Error */}

      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2
              size={32}
              className="animate-spin"
            />

            <p className="text-sm">
              Loading products...
            </p>
          </div>
        </div>
      ) : products.length === 0 ? (

        /* Empty */

        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">

          <PackageOpen
            size={42}
            className="text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No products found
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Try changing your search or category filters.
          </p>

          {(search ||
            categoryId !== undefined) && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Clear filters
            </button>
          )}

        </div>

      ) : (

        /* Products */

        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            hasPreviousPage={
              hasPreviousPage
            }
            hasNextPage={
              hasNextPage
            }
            onPageChange={
              setPage
            }
          />
        </>
      )}

    </div>
  );
}