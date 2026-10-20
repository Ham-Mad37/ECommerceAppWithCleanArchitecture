import { formatDateTime, money } from "../../utils/format";
import type { AdminOrder } from "../../types/order";

export type SheetKind = "invoice" | "packing";

/** Print-only sheet. Explicit colours, so it prints black-on-white even when dark mode is on. */
export default function InvoiceSheet({ data, kind }: { data: AdminOrder; kind: SheetKind }) {
  const { order, customer } = data;
  const a = order.shippingAddress;
  const invoice = kind === "invoice";
  const cell = { padding: "8px 6px", borderBottom: "1px solid #ddd" } as const;

  return (
    <div className="hidden print:block" style={{ background: "#fff", color: "#000", fontSize: 14, lineHeight: 1.5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>E-Commerce</div>
          <div>{invoice ? "INVOICE" : "PACKING SLIP"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>Order #{order.id}</div>
          <div>{formatDateTime(order.createdAt)}</div>
          <div>Status: {order.status}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, margin: "16px 0" }}>
        <div>
          <div style={{ fontWeight: 700 }}>Customer</div>
          <div>{customer.name}</div>
          <div>{customer.email}</div>
        </div>
        {a && (
          <div>
            <div style={{ fontWeight: 700 }}>Ship to</div>
            <div>{a.recipientName}</div>
            <div>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</div>
            <div>{a.city}{a.state ? `, ${a.state}` : ""} {a.postalCode ?? ""}</div>
            <div>{a.country}</div>
            <div>{a.phone}</div>
          </div>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #000" }}>
            <th style={cell}>Item</th>
            <th style={{ ...cell, textAlign: "right" }}>Qty</th>
            {invoice && <th style={{ ...cell, textAlign: "right" }}>Unit price</th>}
            {invoice && <th style={{ ...cell, textAlign: "right" }}>Total</th>}
            {!invoice && <th style={{ ...cell, textAlign: "center" }}>Packed</th>}
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={`${i.productId}-${idx}`}>
              <td style={cell}>{i.productName}</td>
              <td style={{ ...cell, textAlign: "right" }}>{i.quantity}</td>
              {invoice && <td style={{ ...cell, textAlign: "right" }}>{money(i.unitPrice)}</td>}
              {invoice && <td style={{ ...cell, textAlign: "right" }}>{money(i.lineTotal)}</td>}
              {!invoice && <td style={{ ...cell, textAlign: "center" }}>☐</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {invoice && (
        <div style={{ marginTop: 16, marginLeft: "auto", width: 260 }}>
          <Row label="Subtotal" value={money(order.subTotal)} />
          <Row label="Shipping" value={money(order.shippingCost)} />
          {order.discount > 0 && <Row label="Discount" value={`-${money(order.discount)}`} />}
          <Row label="Total" value={money(order.total)} bold />
          {order.payment && <Row label={`Payment (${order.payment.method})`} value={order.payment.status} />}
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 12, color: "#555" }}>Thank you for your order.</div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: bold ? 700 : 400, borderTop: bold ? "2px solid #000" : undefined }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
