import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, PackageOpen } from "lucide-react";

import { orderService } from "../../services/orderService";
import { Alert, Badge, Empty, btnSecondary, card } from "../../components/common/ui";
import { ListSkeleton } from "../../components/common/Skeleton";
import { useReorder } from "../../hooks/useReorder";
import { formatDate, getApiError, money } from "../../utils/format";
import type { Order } from "../../types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const reorder = useReorder();

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).catch((e) => setError(getApiError(e, "Unable to load your orders.")));
  }, []);

  if (error) return <div className="mx-auto max-w-4xl px-4 py-10"><Alert>{error}</Alert></div>;
  if (!orders) return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12"><ListSkeleton rows={4} /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">My orders</h1>
      <p className="mt-2 text-slate-500">Track and manage everything you've ordered.</p>

      {reorder.message && (
        <div className="mt-6"><Alert>{reorder.message} <Link to="/cart" className="font-semibold underline">View cart</Link></Alert></div>
      )}

      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <Empty title="No orders yet">
            <PackageOpen className="mx-auto mb-2 text-slate-300" size={36} />
            <Link to="/products" className="font-medium text-slate-900 underline">Start shopping</Link>
          </Empty>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={`${card} fade-in flex flex-col gap-4 p-5 transition hover:border-slate-400 sm:flex-row sm:items-center`}>
              <Link to={`/orders/${order.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">Order #{order.id}</span>
                    <Badge value={order.status} />
                    {order.payment && <Badge value={order.payment.status} label={`Payment: ${order.payment.status}`} />}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(order.createdAt)} · {order.items.reduce((n, i) => n + i.quantity, 0)} items
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-400">{order.items.map((i) => i.productName).join(", ")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{money(order.total)}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </Link>
              <button type="button" className={btnSecondary} disabled={reorder.busyId === order.id} onClick={() => reorder.run(order)}>
                {reorder.busyId === order.id ? "Adding..." : "Buy again"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
