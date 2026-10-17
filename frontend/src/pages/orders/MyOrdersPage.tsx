import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ChevronRight,
  Loader2,
  Package,
  RefreshCw,
} from "lucide-react";

import { orderService } from "../../services/orderService";

import type {
  Order,
} from "../../types/order";

export default function MyOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await orderService.getMyOrders();

      setOrders(data);
    } catch (error: any) {
      const status =
        error?.response?.status;

      if (status === 401) {
        navigate("/login", {
          state: {
            from: "/orders",
          },
        });

        return;
      }

      setError(
        error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusClasses = (
    status: string
  ) => {
    switch (
      status.toLowerCase()
    ) {
      case "pending":
        return "bg-amber-50 text-amber-700";

      case "processing":
        return "bg-blue-50 text-blue-700";

      case "shipped":
        return "bg-indigo-50 text-indigo-700";

      case "delivered":
        return "bg-green-50 text-green-700";

      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2
            size={34}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Orders
          </h1>

          <p className="mt-2 text-slate-500">
            View and track your previous orders.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:self-auto"
        >
          <RefreshCw size={16} />

          Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">

            <p className="font-semibold">
              Unable to load orders
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="text-sm font-semibold underline"
          >
            Retry
          </button>

        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!error &&
        orders.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">

              <Package
                size={36}
                className="text-slate-400"
              />

            </div>

            <h2 className="mt-6 text-xl font-bold text-slate-900">
              You don't have any orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once you place an order, you'll be able
              to see its status and details here.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start Shopping
            </Link>

          </div>
        )}

      {/* =====================================================
          ORDERS
      ===================================================== */}

      {orders.length > 0 && (
        <div className="mt-8 space-y-4">

          {orders.map(
            (order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6"
              >

                {/* Top */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">

                      <Package
                        size={21}
                        className="text-slate-600"
                      />

                    </div>

                    <div>

                      <p className="font-semibold text-slate-900">
                        Order #{order.id}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <ChevronRight
                      size={20}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
                    />

                  </div>

                </div>

                {/* Bottom */}

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex gap-6">

                    <div>
                      <p className="text-xs text-slate-400">
                        Items
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {order.items.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        $
                        {order.total.toFixed(
                          2
                        )}
                      </p>
                    </div>

                  </div>

                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">
                    View Order
                  </span>

                </div>

              </Link>
            )
          )}

        </div>
      )}

    </div>
  );
}