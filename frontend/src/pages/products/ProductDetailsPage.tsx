import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Minus, Package, Plus, ShoppingCart, X, ZoomIn } from "lucide-react";

import ProductCard from "../../components/products/ProductCard";
import { Skeleton } from "../../components/common/Skeleton";
import { productService } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { getApiError, money } from "../../utils/format";
import type { Product, ProductList } from "../../types/product";

const LOW_STOCK = 5;

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // ---------- load product (+ related) ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        setQuantity(1);
        setAdded(false);
        const productId = Number(id);
        if (!id || Number.isNaN(productId)) throw new Error("Invalid product ID.");

        const data = await productService.getProductById(productId);
        if (cancelled) return;
        setProduct(data);
        const primary = data.images.findIndex((i) => i.isPrimary);
        setImageIndex(Math.max(primary, 0));

        // related products come from the same category; failure here must not break the page
        productService
          .getProducts({ categoryId: data.categoryId, pageNumber: 1, pageSize: 8 })
          .then((r) => !cancelled && setRelated(r.items.filter((p) => p.id !== data.id && p.stockQuantity > 0).slice(0, 4)))
          .catch(() => !cancelled && setRelated([]));
      } catch (e) {
        if (!cancelled) { setProduct(null); setError(getApiError(e, "Unable to load product.")); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const images = product?.images ?? [];
  const step = useCallback((dir: 1 | -1) => setImageIndex((i) => (i + dir + images.length) % Math.max(images.length, 1)), [images.length]);

  // keyboard: Esc closes the zoom view, arrows flip images
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, step]);

  // ---------- loading / not found ----------
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8" role="status" aria-label="Loading product">
        <div className="grid gap-10 lg:grid-cols-2">
          <div><Skeleton className="aspect-square w-full rounded-3xl" /><div className="mt-4 flex gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-20 rounded-xl" />)}</div></div>
          <div className="space-y-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-3/4" /><Skeleton className="h-9 w-32" /><Skeleton className="h-8 w-28 rounded-full" /><Skeleton className="h-24 w-full" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100"><Package size={36} className="text-slate-400" /></div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">{error || "The product you're looking for could not be found."}</p>
        <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <ArrowLeft size={17} /> Back to Products
        </Link>
      </div>
    );
  }

  const stock = product.stockQuantity;
  const hasStock = stock > 0 && product.isActive;
  const lowStock = hasStock && stock <= LOW_STOCK;
  const current = images[imageIndex];

  const setQty = (n: number) => setQuantity(Math.min(Math.max(1, Math.floor(n) || 1), Math.max(stock, 1)));

  const handleAdd = async () => {
    if (!hasStock) return;
    try {
      setAdding(true); setError(""); setAdded(false);
      await addItem(product.id, quantity);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 3000);
    } catch (e) {
      setError(getApiError(e, "Unable to add product to cart."));
    } finally {
      setAdding(false);
    }
  };

  const AddButton = ({ className = "" }: { className?: string }) => (
    <button
      type="button"
      onClick={handleAdd}
      disabled={adding || isAdmin}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {adding ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : added ? <><Check size={18} /> Added</> : <><ShoppingCart size={18} /> Add to cart</>}
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 sm:py-12 lg:px-8 lg:pb-12">
      <Link to="/products" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900">
        <ArrowLeft size={17} /> Back to Products
      </Link>

      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-10 lg:grid-cols-2">
        {/* ---------- gallery ---------- */}
        <div>
          <div className="group relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
            {current ? (
              <button type="button" onClick={() => setZoom(true)} className="block h-full w-full cursor-zoom-in" aria-label="Zoom image">
                <img src={current.url} alt={product.name} className="h-full w-full object-contain" />
                <span className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 opacity-0 shadow transition group-hover:opacity-100"><ZoomIn size={18} /></span>
              </button>
            ) : (
              <div className="flex h-full w-full items-center justify-center"><Package size={80} className="text-slate-300" /></div>
            )}
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800 shadow hover:bg-white"><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-800 shadow hover:bg-white"><ChevronRight size={20} /></button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={img.id} type="button" onClick={() => setImageIndex(i)} aria-label={`Show image ${i + 1}`} aria-current={i === imageIndex}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition ${i === imageIndex ? "border-slate-900" : "border-slate-200 hover:border-slate-400"}`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------- info ---------- */}
        <div className="flex flex-col">
          {product.categoryName && (
            <Link to={`/products?categoryId=${product.categoryId}`} className="text-sm font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900">{product.categoryName}</Link>
          )}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-5 text-3xl font-bold text-slate-900">{money(product.price)}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {!hasStock ? (
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700"><span className="mr-2 h-2 w-2 rounded-full bg-red-500" />{product.isActive ? "Out of stock" : "Unavailable"}</span>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800"><AlertTriangle size={15} />Only {stock} left</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700"><span className="mr-2 h-2 w-2 rounded-full bg-green-500" />{stock} in stock</span>
            )}
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{product.description}</p>
            </div>
          )}

          <div className="my-8 h-px bg-slate-200" />

          {hasStock ? (
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-xl border border-slate-300" role="group" aria-label="Quantity">
                  <button type="button" onClick={() => setQty(quantity - 1)} disabled={quantity <= 1} aria-label="Decrease quantity" className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Minus size={18} /></button>
                  <input type="number" inputMode="numeric" min={1} max={stock} value={quantity} onChange={(e) => setQty(Number(e.target.value))} aria-label="Quantity"
                    className="h-12 w-16 border-x border-slate-300 bg-transparent text-center text-sm font-semibold text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                  <button type="button" onClick={() => setQty(quantity + 1)} disabled={quantity >= stock} aria-label="Increase quantity" className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={18} /></button>
                </div>
                <AddButton className="hidden flex-1 sm:flex sm:flex-none" />
                <span className="text-sm text-slate-500">Total: <strong className="text-slate-900">{money(product.price * quantity)}</strong></span>
              </div>
              {quantity >= stock && stock > 0 && <p className="mt-3 text-xs text-slate-500">That's all we have in stock.</p>}
              {isAdmin && <p className="mt-3 text-xs text-slate-500">Admin accounts can't place orders.</p>}
              {added && (
                <div className="fade-in mt-4 flex items-center justify-between gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  <span className="flex items-center gap-2"><Check size={16} /> Added to your cart.</span>
                  <Link to="/cart" className="font-semibold underline">View cart</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-100 px-5 py-4 text-center text-sm font-medium text-slate-500">This product is currently unavailable.</div>
          )}
        </div>
      </div>

      {/* ---------- related ---------- */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-bold text-slate-900">You may also like</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} onAddToCart={(pid) => addItem(pid, 1).catch(() => undefined)} />)}
          </div>
        </section>
      )}

      {/* ---------- sticky bar on phones ---------- */}
      {hasStock && !isAdmin && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,.06)] sm:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
            <p className="text-sm text-slate-500">{money(product.price * quantity)}{quantity > 1 ? ` · ${quantity} items` : ""}</p>
          </div>
          <AddButton />
        </div>
      )}

      {/* ---------- zoom ---------- */}
      {zoom && current && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setZoom(false)}>
          <button type="button" onClick={() => setZoom(false)} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X size={24} /></button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous image" className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronLeft size={26} /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next image" className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronRight size={26} /></button>
            </>
          )}
          <img src={current.url} alt={product.name} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
