import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";

import { orderService } from "../../services/orderService";
import { Alert, Badge, PageLoader, btnDanger, btnSecondary, card } from "../../components/common/ui";
import { formatDateTime, getApiError, money } from "../../utils/format";
import OrderTracker from "../../components/orders/OrderTracker";
import { useReorder } from "../../hooks/useReorder";
import type { Order } from "../../types/order";

const PAYMENT_LABEL = { CashOnDelivery: "Cash on delivery", BankTransfer: "Bank transfer" } as const;

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const justCreated = (useLocation().state as { orderCreated?: boolean } | null)?.orderCreated === true;

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const reorder = useReorder();

  const load = useCallback(async () => {
    try {
      setOrder(await orderService.getOrderById(Number(orderId)));
      setError("");
    } catch (e) {
      setError(getApiError(e, "Unable to load this order."));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { void load(); }, [load]);

  // The API only lets a customer cancel while the order has not shipped.
  const canCancel = order?.status === "Pending" || order?.status === "Confirmed";

  const handleCancel = async () => {
    if (!order || !window.confirm("Cancel this order? Items will go back into stock.")) return;
    try {
      setCancelling(true);
      await orderService.cancel(order.id);
      await load();
    } catch (e) {
      setError(getApiError(e, "Unable to cancel the order."));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader label="Loading order..." />;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <Alert>{error || "Order not found."}</Alert>
        <Link to="/orders" className="mt-6 inline-block font-medium text-slate-900 underline">Back to my orders</Link>
      </div>
    );
  }

  const address = order.shippingAddress;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft size={17} /> My orders
      </Link>

      {justCreated && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
          <CheckCircle2 className="mt-0.5 text-green-600" />
          <div>
            <p className="font-semibold text-slate-900">Thank you! Your order has been placed.</p>
            {order.payment?.method === "BankTransfer" && (
              <p className="mt-1 text-sm text-slate-600">We'll ship it as soon as your bank transfer is confirmed.</p>
            )}
          </div>
        </div>
      )}

      {error && <div className="mb-6"><Alert>{error}</Alert></div>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge value={order.status} />
          <button type="button" onClick={() => order && reorder.run(order)} disabled={reorder.busyId === order.id} className={btnSecondary}>
            {reorder.busyId === order.id ? "Adding..." : "Buy again"}
          </button>
          {canCancel && (
            <button type="button" onClick={handleCancel} disabled={cancelling} className={btnDanger}>
              {cancelling ? "Cancelling..." : "Cancel order"}
            </button>
          )}
        </div>
      </div>

      {reorder.message && (
        <div className="mb-6"><Alert>{reorder.message} <Link to="/cart" className="font-semibold underline">View cart</Link></Alert></div>
      )}

      <section className={`${card} mb-6 px-4 py-6 sm:px-8`}>
        <OrderTracker status={order.status} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="border-b border-slate-200 px-6 py-4 font-semibold text-slate-900">Items</h2>
            <ul className="divide-y divide-slate-200">
              {order.items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="flex items-center gap-4 p-5 sm:px-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <ShoppingBag size={22} className="text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.productId}`} className="font-semibold text-slate-900 hover:underline">{item.productName}</Link>
                    <p className="mt-0.5 text-sm text-slate-500">{money(item.unitPrice)} × {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-slate-900">{money(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </section>

          {address && (
            <section className={`${card} p-6`}>
              <h2 className="font-semibold text-slate-900">Shipping address</h2>
              <address className="mt-3 text-sm not-italic leading-6 text-slate-600">
                {address.recipientName}<br />
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                {address.city}{address.state ? `, ${address.state}` : ""} {address.postalCode ?? ""}<br />
                {address.country}<br />
                {address.phone}
              </address>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-4">
          <section className={`${card} p-6`}>
            <h2 className="font-semibold text-slate-900">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{money(order.subTotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{money(order.shippingCost)}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd className="text-green-600">-{money(order.discount)}</dd></div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <dt>Total</dt><dd>{money(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.payment && (
            <section className={`${card} p-6 text-sm`}>
              <h2 className="font-semibold text-slate-900">Payment</h2>
              <div className="mt-3 space-y-2 text-slate-600">
                <p>{PAYMENT_LABEL[order.payment.method]}</p>
                <Badge value={order.payment.status} />
                {order.payment.reference && <p>Reference: <span className="font-mono">{order.payment.reference}</span></p>}
                {order.payment.paidAt && <p>Paid {formatDateTime(order.payment.paidAt)}</p>}
                {order.payment.status === "RefundDue" && (
                  <p className="text-red-600">Your payment will be refunded.</p>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
