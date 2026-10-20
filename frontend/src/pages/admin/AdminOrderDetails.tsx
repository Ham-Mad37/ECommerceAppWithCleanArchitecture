import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Printer } from "lucide-react";

import { adminOrders } from "../../services/adminService";
import { Alert, Badge, Field, Modal, PageLoader, btnPrimary, btnSecondary, card, inputCls } from "../../components/common/ui";
import { formatDateTime, getApiError, money } from "../../utils/format";
import InvoiceSheet, { type SheetKind } from "../../components/admin/InvoiceSheet";
import OrderTracker from "../../components/orders/OrderTracker";
import type { AdminOrder } from "../../types/order";

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const id = Number(orderId);

  const [data, setData] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [sheet, setSheet] = useState<SheetKind>("invoice");

  const print = (kind: SheetKind) => {
    setSheet(kind);
    window.setTimeout(() => window.print(), 50); // let React render the right sheet first
  };

  const load = useCallback(async () => {
    try { setData(await adminOrders.get(id)); }
    catch (e) { setError(getApiError(e, "Unable to load the order.")); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  const run = async (action: () => Promise<void>) => {
    try { setBusy(true); setError(""); await action(); await load(); }
    catch (e) { setError(getApiError(e, "That action was rejected.")); }
    finally { setBusy(false); }
  };

  const confirmPayment = async (e: FormEvent) => {
    e.preventDefault();
    await run(() => adminOrders.confirmPayment(id, reference.trim()));
    setPayOpen(false); setReference("");
  };

  if (!data) return error ? <Alert>{error}</Alert> : <PageLoader />;

  const { order, customer } = data;
  const payment = order.payment;
  const bankTransfer = payment?.method === "BankTransfer";
  const needsPayment = payment?.status === "Pending" && order.status !== "Cancelled";

  // exactly one "next step" is valid for each status (mirrors Order.cs)
  const next = {
    Pending: { label: "Approve order", act: () => adminOrders.confirm(id) },
    Confirmed: { label: "Start processing", act: () => adminOrders.startProcessing(id) },
    Processing: { label: "Mark as shipped", act: () => adminOrders.ship(id) },
    Shipped: { label: "Mark as delivered", act: () => adminOrders.deliver(id) },
    Delivered: null,
    Cancelled: null,
  }[order.status];

  const shipBlocked = order.status === "Processing" && bankTransfer && payment?.status !== "Paid";

  return (
    <>
    <InvoiceSheet data={data} kind={sheet} />
    <div className="print:hidden">
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={17} /> Orders</Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatDateTime(order.createdAt)} · {customer.name} ({customer.email})</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={btnSecondary} onClick={() => print("invoice")}><Printer size={16} /> Invoice</button>
          <button className={btnSecondary} onClick={() => print("packing")}><FileText size={16} /> Packing slip</button>
          <Badge value={order.status} />
        </div>
      </div>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <section className={`${card} mb-6 px-4 py-6 sm:px-8`}><OrderTracker status={order.status} /></section>

      <div className={`${card} mb-6 flex flex-wrap items-center gap-3 p-5`}>
        {next && <button className={btnPrimary} disabled={busy || shipBlocked} onClick={() => run(next.act)}>{next.label}</button>}
        {needsPayment && <button className={btnSecondary} disabled={busy} onClick={() => setPayOpen(true)}>Confirm payment</button>}
        {shipBlocked && <span className="text-sm text-amber-700">Bank-transfer orders must be paid before shipping.</span>}
        {!next && <span className="text-sm text-slate-500">No further actions.</span>}
        {payment?.status === "RefundDue" && <span className="text-sm font-medium text-red-600">Refund the customer {money(payment.amount)} manually.</span>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className={card}>
          <h2 className="border-b border-slate-200 px-5 py-4 font-semibold text-slate-900">Items</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {order.items.map((i, idx) => (
                <tr key={`${i.productId}-${idx}`}>
                  <td className="px-5 py-3 font-medium text-slate-900">{i.productName}</td>
                  <td className="px-5 py-3 text-slate-500">{money(i.unitPrice)} × {i.quantity}</td>
                  <td className="px-5 py-3 text-right font-semibold">{money(i.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 text-sm">
              <tr><td colSpan={2} className="px-5 py-2 text-right text-slate-500">Subtotal</td><td className="px-5 py-2 text-right">{money(order.subTotal)}</td></tr>
              <tr><td colSpan={2} className="px-5 py-2 text-right text-slate-500">Shipping</td><td className="px-5 py-2 text-right">{money(order.shippingCost)}</td></tr>
              {order.discount > 0 && <tr><td colSpan={2} className="px-5 py-2 text-right text-slate-500">Discount</td><td className="px-5 py-2 text-right">-{money(order.discount)}</td></tr>}
              <tr><td colSpan={2} className="px-5 py-3 text-right font-semibold">Total</td><td className="px-5 py-3 text-right text-base font-bold">{money(order.total)}</td></tr>
            </tfoot>
          </table>
        </section>

        <div className="space-y-4">
          <section className={`${card} p-5 text-sm`}>
            <h2 className="font-semibold text-slate-900">Payment</h2>
            {payment ? (
              <div className="mt-3 space-y-2 text-slate-600">
                <p>{bankTransfer ? "Bank transfer" : "Cash on delivery"} · {money(payment.amount)}</p>
                <Badge value={payment.status} />
                {payment.reference && <p>Reference: <span className="font-mono">{payment.reference}</span></p>}
                {payment.paidAt && <p>Paid {formatDateTime(payment.paidAt)}</p>}
              </div>
            ) : <p className="mt-3 text-slate-500">No payment record.</p>}
          </section>

          {order.shippingAddress && (
            <section className={`${card} p-5 text-sm`}>
              <h2 className="font-semibold text-slate-900">Ship to</h2>
              <address className="mt-3 not-italic leading-6 text-slate-600">
                {order.shippingAddress.recipientName}<br />
                {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode ?? ""}<br />
                {order.shippingAddress.country}<br />{order.shippingAddress.phone}
              </address>
            </section>
          )}
        </div>
      </div>

      <Modal open={payOpen} title="Confirm payment" onClose={() => setPayOpen(false)}>
        <form onSubmit={confirmPayment} className="space-y-4">
          <Field label={bankTransfer ? "Transfer reference (required)" : "Reference (optional)"}>
            <input className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} maxLength={100} required={bankTransfer} autoFocus />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={() => setPayOpen(false)}>Cancel</button>
            <button className={btnPrimary} disabled={busy}>Mark as paid</button>
          </div>
        </form>
      </Modal>
    </div>
    </>
  );
}
