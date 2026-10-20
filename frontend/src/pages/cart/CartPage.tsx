import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Bookmark, Loader2, Minus, Package, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { cartService } from "../../services/cartService";
import { useCart } from "../../context/CartContext";
import { useSavedForLater } from "../../hooks/useSavedForLater";
import { Alert, btnPrimary, btnSecondary, card } from "../../components/common/ui";
import { ListSkeleton } from "../../components/common/Skeleton";
import { blockingItems, stockState } from "../../utils/cartIssues";
import { getApiError, money } from "../../utils/format";
import type { Cart, CartItem } from "../../types/cart";

function Thumb({ url, name }: { url: string | null; name: string }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" loading="lazy" /> : <Package size={28} className="text-slate-300" />}
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { refresh: refreshBadge, addItem } = useCart();
  const saved = useSavedForLater();

  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    try {
      setCart(await cartService.getCart());
      setError("");
    } catch (e) {
      setError(getApiError(e, "Unable to load your cart."));
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  /** runs one cart change for one product, then reloads the cart and the header badge */
  const run = async (productId: number, action: () => Promise<void>) => {
    try {
      setBusyId(productId);
      setError("");
      await action();
      await Promise.all([load(), refreshBadge()]);
    } catch (e) {
      setError(getApiError(e, "That change could not be saved."));
      await load(); // show the real quantities again
    } finally {
      setBusyId(null);
    }
  };

  const setQuantity = (item: CartItem, quantity: number) => {
    if (quantity < 1) return remove(item);
    return run(item.productId, () => cartService.updateItem(item.productId, quantity));
  };
  const remove = (item: CartItem) => run(item.productId, () => cartService.removeItem(item.productId));
  const saveForLater = (item: CartItem) =>
    run(item.productId, async () => {
      await cartService.removeItem(item.productId);
      saved.save({ productId: item.productId, productName: item.productName, unitPrice: item.unitPrice, imageUrl: item.imageUrl, quantity: item.quantity });
    });
  const moveToCart = async (productId: number, quantity: number) => {
    try {
      setBusyId(productId);
      setError("");
      await addItem(productId, Math.max(quantity, 1));
      saved.remove(productId);
      await load();
    } catch (e) {
      setError(getApiError(e, "That product can't be added right now (it may be out of stock)."));
    } finally {
      setBusyId(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Remove every item from your cart?")) return;
    try { setClearing(true); await cartService.clear(); await Promise.all([load(), refreshBadge()]); }
    catch (e) { setError(getApiError(e, "Unable to clear the cart.")); }
    finally { setClearing(false); }
  };

  if (!cart) {
    return <div className="mx-auto max-w-5xl px-4 py-10">{error ? <Alert>{error}</Alert> : <ListSkeleton rows={3} />}</div>;
  }

  const blocked = blockingItems(cart);
  const units = cart.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={17} /> Continue shopping</Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shopping cart</h1>
          <p className="mt-1 text-slate-500">{units} item{units === 1 ? "" : "s"}</p>
        </div>
        {cart.items.length > 0 && <button className={btnSecondary} onClick={clearCart} disabled={clearing}><Trash2 size={16} /> Clear cart</button>}
      </div>

      {error && <div className="mb-6"><Alert>{error}</Alert></div>}

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ShoppingBag size={44} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Your cart is empty</h2>
          <Link to="/products" className={`${btnPrimary} mt-6`}>Browse products</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-4">
            {cart.items.map((item) => {
              const state = stockState(item);
              const busy = busyId === item.productId;
              return (
                <li key={item.productId} className={`${card} p-4 sm:p-5 ${state === "out" || state === "over" ? "border-red-300" : ""}`}>
                  <div className="flex gap-4">
                    <Thumb url={item.imageUrl} name={item.productName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link to={`/products/${item.productId}`} className="font-semibold text-slate-900 hover:underline">{item.productName}</Link>
                        <span className="shrink-0 font-bold text-slate-900">{money(item.lineTotal)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{money(item.unitPrice)} each</p>

                      {state === "out" && <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertTriangle size={15} /> Out of stock. Remove it or save it for later.</p>}
                      {state === "over" && (
                        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm font-medium text-red-600">
                          <span className="flex items-center gap-1.5"><AlertTriangle size={15} /> Only {item.availableStock} available.</span>
                          <button className="underline" disabled={busy} onClick={() => setQuantity(item, item.availableStock)}>Set to {item.availableStock}</button>
                        </p>
                      )}
                      {state === "low" && <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-amber-700"><AlertTriangle size={15} /> Only {item.availableStock} left in stock</p>}

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-lg border border-slate-300" role="group" aria-label={`Quantity for ${item.productName}`}>
                          <button type="button" aria-label="Decrease quantity" disabled={busy || item.quantity <= 1} onClick={() => setQuantity(item, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"><Minus size={16} /></button>
                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-slate-300 px-2 text-sm font-semibold">{busy ? <Loader2 size={15} className="animate-spin" /> : item.quantity}</span>
                          <button type="button" aria-label="Increase quantity" disabled={busy || item.quantity >= item.availableStock} onClick={() => setQuantity(item, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"><Plus size={16} /></button>
                        </div>
                        <button type="button" disabled={busy} onClick={() => saveForLater(item)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"><Bookmark size={15} /> Save for later</button>
                        <button type="button" disabled={busy} onClick={() => remove(item)} className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"><Trash2 size={15} /> Remove</button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className={`${card} p-6`}>
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Subtotal ({units} items)</dt><dd className="font-medium">{money(cart.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd className="font-medium">Free</dd></div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900"><dt>Total</dt><dd className="text-xl">{money(cart.subtotal)}</dd></div>
              </dl>
              <button type="button" className={`${btnPrimary} mt-6 w-full py-3.5`} disabled={blocked.length > 0} onClick={() => navigate("/checkout")}>Proceed to checkout</button>
              {blocked.length > 0 && (
                <p className="mt-3 text-center text-xs leading-5 text-red-600">
                  Fix {blocked.length} item{blocked.length === 1 ? "" : "s"} above (stock changed) to continue.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}

      {saved.items.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Saved for later ({saved.items.length})</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {saved.items.map((s) => (
              <li key={s.productId} className={`${card} flex items-center gap-4 p-4`}>
                <Thumb url={s.imageUrl} name={s.productName} />
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${s.productId}`} className="block truncate font-semibold text-slate-900 hover:underline">{s.productName}</Link>
                  <p className="text-sm text-slate-500">{money(s.unitPrice)}</p>
                  <div className="mt-2 flex gap-3 text-sm font-medium">
                    <button disabled={busyId === s.productId} onClick={() => moveToCart(s.productId, s.quantity)} className="text-slate-900 underline">Move to cart</button>
                    <button onClick={() => saved.remove(s.productId)} className="text-slate-500 hover:text-red-600">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
