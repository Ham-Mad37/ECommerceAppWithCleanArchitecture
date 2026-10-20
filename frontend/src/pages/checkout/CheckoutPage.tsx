import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, Loader2, MapPin, Package } from "lucide-react";

import { cartService } from "../../services/cartService";
import { addressService } from "../../services/addressService";
import { orderService } from "../../services/orderService";
import { useCart } from "../../context/CartContext";
import { Alert, btnPrimary, btnSecondary, card } from "../../components/common/ui";
import { ListSkeleton } from "../../components/common/Skeleton";
import { blockingItems } from "../../utils/cartIssues";
import { getApiError, money } from "../../utils/format";
import type { Cart } from "../../types/cart";
import type { Address } from "../../types/address";
import type { PaymentMethod } from "../../types/order";

const PAYMENT_OPTIONS: { value: PaymentMethod; title: string; hint: string }[] = [
  { value: "CashOnDelivery", title: "Cash on delivery", hint: "Pay when your order arrives." },
  { value: "BankTransfer", title: "Bank transfer", hint: "We ship after we confirm your transfer." },
];

type Step = "details" | "review";

function AddressText({ a }: { a: Address }) {
  return (
    <address className="text-sm not-italic leading-6 text-slate-600">
      <span className="font-semibold text-slate-900">{a.recipientName}</span><br />
      {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
      {[a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ")}<br />
      {a.phone}
    </address>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { refresh: refreshBadge } = useCart();

  const [step, setStep] = useState<Step>("details");
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("CashOnDelivery");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([cartService.getCart(), addressService.getAddresses()])
      .then(([c, a]) => {
        if (cancelled) return;
        setCart(c);
        setAddresses(a);
        setAddressId((a.find((x) => x.isDefault) ?? a[0])?.id ?? null);
      })
      .catch((e) => !cancelled && setError(getApiError(e, "Unable to load checkout.")));
    return () => { cancelled = true; };
  }, []);

  if (!cart || !addresses) {
    return <div className="mx-auto max-w-5xl px-4 py-10">{error ? <Alert>{error}</Alert> : <ListSkeleton rows={3} />}</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Add something before checking out.</p>
        <Link to="/products" className={`${btnPrimary} mt-6`}>Browse products</Link>
      </div>
    );
  }

  const blocked = blockingItems(cart);
  const address = addresses.find((a) => a.id === addressId) ?? null;
  const method = PAYMENT_OPTIONS.find((o) => o.value === payment)!;
  const units = cart.items.reduce((n, i) => n + i.quantity, 0);

  const placeOrder = async () => {
    if (!address || blocked.length > 0) return;
    try {
      setPlacing(true);
      setError("");
      const orderId = await orderService.createOrder(address.id, payment);
      await refreshBadge();
      navigate(`/orders/${orderId}`, { replace: true, state: { orderCreated: true } });
    } catch (e) {
      // stock may have changed since the cart loaded - show the message and let the customer fix the cart
      setError(getApiError(e, "We couldn't place your order."));
      setStep("details");
      setCart(await cartService.getCart().catch(() => cart));
    } finally {
      setPlacing(false);
    }
  };

  const steps: { id: Step; label: string }[] = [{ id: "details", label: "Delivery & payment" }, { id: "review", label: "Review & place order" }];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link to="/cart" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={17} /> Back to cart</Link>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Checkout</h1>

      <ol className="mt-6 flex items-center gap-3 text-sm font-medium" aria-label="Checkout steps">
        {steps.map((s, i) => {
          const active = s.id === step;
          const done = step === "review" && s.id === "details";
          return (
            <li key={s.id} className="flex items-center gap-3" aria-current={active ? "step" : undefined}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done || active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"}`}>{done ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
              <span className={active ? "text-slate-900" : "text-slate-400"}>{s.label}</span>
              {i === 0 && <span className="mx-1 h-px w-8 bg-slate-300" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 space-y-3">
        {error && <Alert>{error}</Alert>}
        {blocked.length > 0 && (
          <Alert>Some items are no longer available in the quantity you chose: <strong>{blocked.map((i) => i.productName).join(", ")}</strong>. <Link to="/cart" className="font-semibold underline">Update your cart</Link></Alert>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {step === "details" ? (
            <>
              <section className={`${card} p-6`}>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><MapPin size={19} /> Delivery address</h2>
                  <Link to="/addresses" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Manage addresses</Link>
                </div>
                {addresses.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm text-slate-500">You have no saved address yet.</p>
                    <Link to="/addresses" className={`${btnPrimary} mt-4`}>Add an address</Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3" role="radiogroup" aria-label="Delivery address">
                    {addresses.map((a) => (
                      <label key={a.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${a.id === addressId ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                        <input type="radio" name="address" checked={a.id === addressId} onChange={() => setAddressId(a.id)} className="mt-1 accent-slate-900" />
                        <div className="flex-1">
                          <AddressText a={a} />
                          {a.isDefault && <span className="mt-2 inline-block rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">Default</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <fieldset className={`${card} p-6`}>
                <legend className="sr-only">Payment method</legend>
                <h2 className="text-lg font-semibold text-slate-900">Payment method</h2>
                <div className="mt-4 space-y-3">
                  {PAYMENT_OPTIONS.map((o) => (
                    <label key={o.value} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${payment === o.value ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                      <input type="radio" name="payment" checked={payment === o.value} onChange={() => setPayment(o.value)} className="mt-1 accent-slate-900" />
                      <span><span className="block font-medium text-slate-900">{o.title}</span><span className="block text-sm text-slate-500">{o.hint}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button className={`${btnPrimary} w-full py-3.5 sm:w-auto`} disabled={!address || blocked.length > 0} onClick={() => { setError(""); setStep("review"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Continue to review
              </button>
              {!address && addresses.length > 0 && <p className="text-xs text-amber-600">Select a delivery address to continue.</p>}
            </>
          ) : (
            <>
              <section className={`${card} p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="font-semibold text-slate-900">Deliver to</h2><div className="mt-3">{address && <AddressText a={address} />}</div></div>
                  <button className="text-sm font-semibold text-slate-700 underline" onClick={() => setStep("details")}>Change</button>
                </div>
              </section>

              <section className={`${card} p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="font-semibold text-slate-900">Payment</h2><p className="mt-3 text-sm text-slate-600"><span className="font-medium text-slate-900">{method.title}</span><br />{method.hint}</p></div>
                  <button className="text-sm font-semibold text-slate-700 underline" onClick={() => setStep("details")}>Change</button>
                </div>
              </section>

              <section className={card}>
                <h2 className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-900">Items ({units})</h2>
                <ul className="divide-y divide-slate-200">
                  {cart.items.map((i) => (
                    <li key={i.productId} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {i.imageUrl ? <img src={i.imageUrl} alt="" className="h-full w-full object-cover" /> : <Package size={22} className="text-slate-300" />}
                      </div>
                      <div className="min-w-0 flex-1"><p className="truncate font-medium text-slate-900">{i.productName}</p><p className="text-sm text-slate-500">{money(i.unitPrice)} × {i.quantity}</p></div>
                      <span className="font-semibold text-slate-900">{money(i.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="flex flex-wrap gap-3">
                <button className={btnSecondary} onClick={() => setStep("details")} disabled={placing}><ArrowLeft size={16} /> Back</button>
              </div>
            </>
          )}
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className={`${card} p-6`}>
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Items ({units})</dt><dd className="font-medium">{money(cart.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd className="font-medium">Free</dd></div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900"><dt>Total</dt><dd className="text-2xl">{money(cart.subtotal)}</dd></div>
            </dl>

            {step === "review" ? (
              <>
                <button className={`${btnPrimary} mt-6 w-full py-3.5`} disabled={placing || !address || blocked.length > 0} onClick={placeOrder}>
                  {placing ? <><Loader2 size={18} className="animate-spin" /> Placing order...</> : <><CheckCircle2 size={18} /> Place order · {money(cart.subtotal)}</>}
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-slate-400">By placing this order you confirm the items, quantities and address above are correct.</p>
              </>
            ) : (
              <p className="mt-5 text-xs leading-5 text-slate-400">You'll review everything before the order is placed.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
