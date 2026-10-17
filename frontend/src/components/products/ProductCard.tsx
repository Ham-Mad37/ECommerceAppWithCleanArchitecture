import { Link } from "react-router-dom";
import { ShoppingCart, Package } from "lucide-react";

import type { ProductList } from "../../types/product";

interface ProductCardProps {
  product: ProductList;
  onAddToCart?: (productId: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const imageUrl =
    product.primaryImageUrl ||
    "https://placehold.co/600x600?text=No+Image";

  const outOfStock =
    product.stockQuantity <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Image */}

      <Link
        to={`/products/${product.id}`}
        className="block overflow-hidden bg-slate-100"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content */}

      <div className="p-4">

        <div className="mb-2 flex items-center justify-between gap-3">

          <span className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            {product.categoryName}
          </span>

          {product.isActive ? (
            <span className="shrink-0 text-xs font-medium text-emerald-600">
              Available
            </span>
          ) : (
            <span className="shrink-0 text-xs font-medium text-red-500">
              Inactive
            </span>
          )}

        </div>

        <Link
          to={`/products/${product.id}`}
          className="block"
        >
          <h2 className="line-clamp-2 min-h-12 text-base font-semibold text-slate-900 transition hover:text-slate-600">
            {product.name}
          </h2>
        </Link>

        <div className="mt-4 flex items-end justify-between gap-3">

          <div>
            <p className="text-xl font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Package size={13} />

              {outOfStock
                ? "Out of stock"
                : `${product.stockQuantity} available`}
            </p>
          </div>

          <button
            type="button"
            disabled={
              outOfStock ||
              !product.isActive
            }
            onClick={() =>
              onAddToCart?.(product.id)
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            title="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>

        </div>
      </div>
    </article>
  );
}