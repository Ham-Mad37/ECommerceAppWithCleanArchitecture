import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { cartService } from "../../services/cartService";

import type {
  Cart,
  CartItem,
} from "../../types/cart";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] =
    useState<Cart | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingProductId, setUpdatingProductId] =
    useState<number | null>(null);

  /*
   * Load cart
   */
  const loadCart = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await cartService.getCart();

        setCart(data);
      } catch (error: any) {
        const status =
          error?.response?.status;

        /*
         * User is not authenticated
         */
        if (status === 401) {
          navigate("/login", {
            state: {
              from: "/cart",
            },
          });

          return;
        }

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Unable to load your cart.";

        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  /*
   * Load cart when page opens
   */
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /*
   * Update item quantity
   */
  const handleUpdateItem = async (
    productId: number,
    quantity: number
  ) => {
    if (quantity <= 0) {
      return;
    }

    try {
      setError("");

      setUpdatingProductId(
        productId
      );

      await cartService.updateItem(
        productId,
        quantity
      );

      await loadCart();

    } catch (error: any) {
      const message =
        error?.response?.data?.detail ??
        error?.response?.data?.message ??
        error?.response?.data?.title ??
        "Unable to update cart.";

      setError(message);

    } finally {
      setUpdatingProductId(null);
    }
  };

  /*
   * Remove item
   */
  const handleRemoveItem = async (
    productId: number
  ) => {
    try {
      setError("");

      setUpdatingProductId(
        productId
      );

      await cartService.removeItem(
        productId
      );

      await loadCart();

    } catch (error: any) {
      const message =
        error?.response?.data?.detail ??
        error?.response?.data?.message ??
        error?.response?.data?.title ??
        "Unable to remove item.";

      setError(message);

    } finally {
      setUpdatingProductId(null);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="flex flex-col items-center gap-3 text-slate-500">

          <Loader2
            size={34}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading your cart...
          </p>

        </div>

      </div>
    );
  }

  /*
   * Error
   */
  if (error && !cart) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">

        <h1 className="text-2xl font-bold text-slate-900">
          Unable to load cart
        </h1>

        <p className="mt-2 max-w-md text-slate-500">
          {error}
        </p>

        <button
          type="button"
          onClick={loadCart}
          className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Try again
        </button>

      </div>
    );
  }

  /*
   * Empty cart
   */
  if (
    !cart ||
    cart.items.length === 0
  ) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">

          <ShoppingBag
            size={34}
            className="text-slate-400"
          />

        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Your cart is empty
        </h1>

        <p className="mt-2 max-w-md text-slate-500">
          You haven't added anything to your cart yet.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Continue shopping
        </Link>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      {/* Header */}

      <div className="mb-8">

        <Link
          to="/products"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />

          Continue shopping
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Shopping Cart
        </h1>

        <p className="mt-2 text-slate-500">
          Review your items before checkout.
        </p>

      </div>

      {/* Error while updating */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Cart */}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

        {/* Items */}

        <div className="space-y-4">

          {cart.items.map(
            (item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                updating={
                  updatingProductId ===
                  item.productId
                }
                onUpdate={
                  handleUpdateItem
                }
                onRemove={
                  handleRemoveItem
                }
              />
            )
          )}

        </div>

        {/* Summary */}

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

          <h2 className="text-lg font-semibold text-slate-900">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">

            {/* Subtotal */}

            <div className="flex justify-between text-sm">

              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="font-medium text-slate-900">
                ${cart.subtotal.toFixed(2)}
              </span>

            </div>

            <div className="h-px bg-slate-200" />

            {/* Total */}

            <div className="flex items-center justify-between">

              <span className="font-semibold text-slate-900">
                Total
              </span>

              <span className="text-2xl font-bold text-slate-900">
                ${cart.subtotal.toFixed(2)}
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/checkout")
            }
            className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Proceed to Checkout
          </button>

        </div>

      </div>

    </div>
  );
}


/*
 * Individual cart item
 */

interface CartItemRowProps {
  item: CartItem;

  updating: boolean;

  onUpdate: (
    productId: number,
    quantity: number
  ) => void;

  onRemove: (
    productId: number
  ) => void;
}

function CartItemRow({
  item,
  updating,
  onUpdate,
  onRemove,
}: CartItemRowProps) {
  const imageUrl =
    item.imageUrl ||
    "https://placehold.co/200x200?text=No+Image";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="flex gap-4">

        {/* Product image */}

        <Link
          to={`/products/${item.productId}`}
          className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28"
        >
          <img
            src={imageUrl}
            alt={item.productName}
            className="h-full w-full object-cover"
          />
        </Link>

        {/* Product information */}

        <div className="min-w-0 flex-1">

          <Link
            to={`/products/${item.productId}`}
            className="line-clamp-2 text-base font-semibold text-slate-900 transition hover:text-slate-600"
          >
            {item.productName}
          </Link>

          <p className="mt-2 text-sm text-slate-500">
            ${item.unitPrice.toFixed(2)} each
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">

            {/* Quantity */}

            <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">

              {/* Decrease */}

              <button
                type="button"
                disabled={
                  updating ||
                  item.quantity <= 1
                }
                onClick={() =>
                  onUpdate(
                    item.productId,
                    item.quantity - 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {updating ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Minus size={15} />
                )}
              </button>

              {/* Quantity */}

              <span className="flex h-9 min-w-10 items-center justify-center border-x border-slate-200 px-2 text-sm font-semibold text-slate-900">
                {item.quantity}
              </span>

              {/* Increase */}

              <button
                type="button"
                disabled={
                  updating ||
                  item.quantity >=
                    item.availableStock
                }
                onClick={() =>
                  onUpdate(
                    item.productId,
                    item.quantity + 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={15} />
              </button>

            </div>

            {/* Price + remove */}

            <div className="flex items-center gap-4">

              <span className="font-semibold text-slate-900">
                ${item.lineTotal.toFixed(2)}
              </span>

              {/* Remove */}

              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  onRemove(
                    item.productId
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Remove item"
              >
                {updating ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={17} />
                )}
              </button>

            </div>

          </div>

          {/* Available stock */}

          <p className="mt-3 text-xs text-slate-400">
            {item.availableStock} available
          </p>

        </div>

      </div>

    </div>
  );
}