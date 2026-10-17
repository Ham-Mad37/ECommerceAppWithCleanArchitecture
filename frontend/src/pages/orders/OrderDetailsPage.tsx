import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Package,
} from "lucide-react";

import { orderService } from "../../services/orderService";

import type {
  Order,
} from "../../types/order";

export default function OrderDetailsPage() {
  const {
    orderId,
  } = useParams<{
    orderId: string;
  }>();

  const navigate = useNavigate();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOrder =
      async () => {
        if (!orderId) {
          setError(
            "Order ID is missing."
          );

          setLoading(false);

          return;
        }

        const id =
          Number(orderId);

        if (
          Number.isNaN(id)
        ) {
          setError(
            "Invalid order ID."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          const data =
            await orderService.getOrderById(
              id
            );

          setOrder(data);
        } catch (error: any) {
          const status =
            error?.response?.status;

          if (status === 401) {
            navigate("/login", {
              state: {
                from: `/orders/${orderId}`,
              },
            });

            return;
          }

          setError(
            error?.response?.data?.detail ??
              error?.response?.data?.message ??
              error?.response?.data?.title ??
              "Unable to load this order."
          );
        } finally {
          setLoading(false);
        }
      };

    loadOrder();
  }, [
    orderId,
    navigate,
  ]);

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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">

          <Loader2
            size={34}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading order...
          </p>

        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">

          <AlertCircle
            size={36}
            className="text-red-400"
          />

        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Unable to load order
        </h1>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error ||
            "The requested order could not be found."}
        </p>

        <Link
          to="/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={17} />

          Back to My Orders
        </Link>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      {/* =====================================================
          BACK
      ===================================================== */}

      <Link
        to="/orders"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />

        Back to My Orders
      </Link>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Order
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            #{order.id}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Placed{" "}
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

        <span
          className={`self-start rounded-full px-4 py-2 text-sm font-semibold sm:self-auto ${getStatusClasses(
            order.status
          )}`}
        >
          {order.status}
        </span>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">

        {/* ===================================================
            ITEMS
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <h2 className="font-semibold text-slate-900">
              Order Items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {order.items.length}{" "}
              {order.items.length === 1
                ? "item"
                : "items"}
            </p>

          </div>

          <div className="divide-y divide-slate-200">

            {order.items.map(
              (
                item,
                index
              ) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex gap-4 p-5 sm:p-6"
                >

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100">

                    <Package
                      size={25}
                      className="text-slate-400"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="font-semibold text-slate-900">
                      {
                        item.productName
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      $
                      {item.unitPrice.toFixed(
                        2
                      )}{" "}
                      ×{" "}
                      {item.quantity}
                    </p>

                  </div>

                  <p className="shrink-0 font-semibold text-slate-900">
                    $
                    {item.lineTotal.toFixed(
                      2
                    )}
                  </p>

                </div>
              )
            )}

          </div>

        </section>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between text-sm">

              <span className="text-slate-500">
                Items
              </span>

              <span className="font-medium">
                {order.items.length}
              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-slate-500">
                Status
              </span>

              <span className="font-medium">
                {order.status}
              </span>

            </div>

            <div className="h-px bg-slate-200" />

            <div className="flex items-center justify-between">

              <span className="font-semibold text-slate-900">
                Total
              </span>

              <span className="text-2xl font-bold text-slate-900">
                $
                {order.total.toFixed(
                  2
                )}
              </span>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}