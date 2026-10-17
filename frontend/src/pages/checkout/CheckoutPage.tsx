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
  CheckCircle2,
  Loader2,
  MapPin,
  ShoppingBag,
} from "lucide-react";

import { cartService } from "../../services/cartService";
import { addressService } from "../../services/addressService";
import { orderService } from "../../services/orderService";

import type { Cart } from "../../types/cart";
import type { Address } from "../../types/address";

export default function CheckoutPage() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [cart, setCart] =
    useState<Cart | null>(null);

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingAddresses,
    setLoadingAddresses,
  ] = useState(true);

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD CART
  // =========================================================

  const loadCart = useCallback(
    async () => {
      try {
        const data =
          await cartService.getCart();

        setCart(data);

        return data;
      } catch (error: any) {
        const status =
          error?.response?.status;

        if (status === 401) {
          navigate("/login", {
            state: {
              from: "/checkout",
            },
          });

          return null;
        }

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Unable to load your cart.";

        throw new Error(message);
      }
    },
    [navigate]
  );

  // =========================================================
  // LOAD ADDRESSES
  // =========================================================

  const loadAddresses =
    useCallback(async () => {
      try {
        setLoadingAddresses(true);

        const data =
          await addressService.getAddresses();

        setAddresses(data);

        // Select default address automatically
        const defaultAddress =
          data.find(
            (address) =>
              address.isDefault
          );

        if (defaultAddress) {
          setSelectedAddressId(
            defaultAddress.id
          );
        } else if (data.length > 0) {
          // If no default address exists,
          // select the first address.
          setSelectedAddressId(
            data[0].id
          );
        } else {
          setSelectedAddressId(null);
        }

        return data;
      } catch (error: any) {
        const status =
          error?.response?.status;

        if (status === 401) {
          navigate("/login", {
            state: {
              from: "/checkout",
            },
          });

          return null;
        }

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Unable to load your addresses.";

        throw new Error(message);
      } finally {
        setLoadingAddresses(false);
      }
    }, [navigate]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadCheckout =
      async () => {
        try {
          setLoading(true);
          setError("");

          await Promise.all([
            loadCart(),
            loadAddresses(),
          ]);
        } catch (error: any) {
          setError(
            error?.message ??
              "Unable to load checkout."
          );
        } finally {
          setLoading(false);
        }
      };

    loadCheckout();
  }, [
    loadCart,
    loadAddresses,
  ]);

  // =========================================================
  // PLACE ORDER
  // =========================================================

  const handlePlaceOrder =
    async () => {
      // -----------------------------------------------
      // Validate selected address
      // -----------------------------------------------

      if (
        selectedAddressId === null
      ) {
        setError(
          "Please select a shipping address before placing your order."
        );

        return;
      }

      // -----------------------------------------------
      // Validate cart
      // -----------------------------------------------

      if (
        !cart ||
        cart.items.length === 0
      ) {
        setError(
          "Your cart is empty."
        );

        return;
      }

      try {
        setPlacingOrder(true);
        setError("");

        // ---------------------------------------------
        // Create order
        // ---------------------------------------------

        const orderId =
          await orderService.createOrder(
            selectedAddressId
          );

        // ---------------------------------------------
        // Navigate to order
        // ---------------------------------------------

        navigate(
          `/orders/${orderId}`,
          {
            replace: true,
            state: {
              orderCreated: true,
            },
          }
        );
      } catch (error: any) {
        const status =
          error?.response?.status;

        // ---------------------------------------------
        // Unauthorized
        // ---------------------------------------------

        if (status === 401) {
          navigate("/login", {
            state: {
              from: "/checkout",
            },
          });

          return;
        }

        // ---------------------------------------------
        // Business / API error
        // ---------------------------------------------

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Unable to place your order.";

        setError(message);
      } finally {
        setPlacingOrder(false);
      }
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">

          <Loader2
            size={34}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading checkout...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // CART ERROR
  // =========================================================

  if (!cart) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">

          <ShoppingBag
            size={34}
            className="text-red-400"
          />

        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Unable to load checkout
        </h1>

        <p className="mt-2 max-w-md text-slate-500">
          {error ||
            "Something went wrong while loading your checkout."}
        </p>

        <Link
          to="/cart"
          className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to Cart
        </Link>

      </div>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (
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

        <p className="mt-2 text-slate-500">
          Add some products before checking out.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Continue Shopping
        </Link>

      </div>
    );
  }

  // =========================================================
  // MAIN CHECKOUT
  // =========================================================

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-8">

        <Link
          to="/cart"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />

          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Checkout
        </h1>

        <p className="mt-2 text-slate-500">
          Review your address and order before placing it.
        </p>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="space-y-8">

          {/* ===============================================
              SHIPPING ADDRESS
          =============================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            {/* Header */}

            <div className="mb-6 flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">

                <MapPin
                  size={20}
                  className="text-slate-600"
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Shipping Address
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select where you want your order delivered.
                </p>

              </div>

            </div>

            {/* Loading addresses */}

            {loadingAddresses ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">

                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Loading addresses...

              </div>
            ) : addresses.length === 0 ? (

              /* =========================================
                 NO ADDRESSES
              ========================================= */

              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">

                <MapPin
                  size={32}
                  className="mx-auto text-slate-400"
                />

                <h3 className="mt-3 font-semibold text-slate-900">
                  No saved addresses
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  You need to add a shipping address before you can place an order.
                </p>

                <Link
                  to="/addresses"
                  className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add Address
                </Link>

              </div>

            ) : (

              /* =========================================
                 ADDRESS LIST
              ========================================= */

              <div className="space-y-3">

                {addresses.map(
                  (address) => {

                    const isSelected =
                      selectedAddressId ===
                      address.id;

                    return (
                      <label
                        key={address.id}
                        className={`block cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                      >

                        <div className="flex gap-3">

                          {/* Radio */}

                          <input
                            type="radio"
                            name="shippingAddress"
                            value={address.id}
                            checked={
                              isSelected
                            }
                            onChange={() => {
                              setSelectedAddressId(
                                address.id
                              );

                              setError("");
                            }}
                            className="mt-1 h-4 w-4 accent-slate-900"
                          />

                          {/* Address information */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="font-semibold text-slate-900">
                                {
                                  address.recipientName
                                }
                              </p>

                              {address.isDefault && (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                  Default
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-sm text-slate-600">
                              {address.phone}
                            </p>

                            <div className="mt-2 space-y-0.5">

                              <p className="text-sm text-slate-600">
                                {address.line1}
                              </p>

                              {address.line2 && (
                                <p className="text-sm text-slate-600">
                                  {
                                    address.line2
                                  }
                                </p>
                              )}

                              <p className="text-sm text-slate-600">

                                {address.city}

                                {address.state &&
                                  `, ${address.state}`}

                                {address.postalCode &&
                                  ` ${address.postalCode}`}

                              </p>

                              <p className="text-sm text-slate-600">
                                {address.country}
                              </p>

                            </div>

                          </div>

                        </div>

                      </label>
                    );
                  }
                )}

                {/* Add another address */}

                <div className="pt-2">

                  <Link
                    to="/addresses"
                    className="inline-flex items-center text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                  >
                    + Add another address
                  </Link>

                </div>

              </div>
            )}

          </section>

          {/* ===============================================
              ORDER ITEMS
          =============================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Header */}

            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

              <h2 className="font-semibold text-slate-900">
                Order Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {cart.items.length}{" "}
                {cart.items.length === 1
                  ? "product"
                  : "products"}
              </p>

            </div>

            {/* Items */}

            <div className="divide-y divide-slate-200">

              {cart.items.map(
                (item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-5 sm:p-6"
                  >

                    {/* Product image */}

                    <Link
                      to={`/products/${item.productId}`}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                    >

                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={
                            item.productName
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">

                          <ShoppingBag
                            size={24}
                            className="text-slate-300"
                          />

                        </div>
                      )}

                    </Link>

                    {/* Product information */}

                    <div className="min-w-0 flex-1">

                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold text-slate-900 transition hover:text-slate-600"
                      >
                        {
                          item.productName
                        }
                      </Link>

                      <p className="mt-1 text-sm text-slate-500">
                        $
                        {item.unitPrice.toFixed(
                          2
                        )}

                        {" "}×{" "}

                        {item.quantity}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Available stock:{" "}
                        {
                          item.availableStock
                        }
                      </p>

                    </div>

                    {/* Line total */}

                    <div className="shrink-0 text-right">

                      <p className="font-semibold text-slate-900">
                        $
                        {item.lineTotal.toFixed(
                          2
                        )}
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

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
                $
                {cart.subtotal.toFixed(
                  2
                )}
              </span>

            </div>

            {/* Shipping */}

            <div className="flex justify-between text-sm">

              <span className="text-slate-500">
                Shipping
              </span>

              <span className="font-medium text-slate-900">
                Free
              </span>

            </div>

            {/* Divider */}

            <div className="h-px bg-slate-200" />

            {/* Total */}

            <div className="flex items-center justify-between">

              <span className="font-semibold text-slate-900">
                Total
              </span>

              <span className="text-2xl font-bold text-slate-900">
                $
                {cart.subtotal.toFixed(
                  2
                )}
              </span>

            </div>

          </div>

          {/* =============================================
              PLACE ORDER
          ============================================= */}

          <button
            type="button"
            disabled={
              placingOrder ||
              selectedAddressId === null ||
              addresses.length === 0
            }
            onClick={
              handlePlaceOrder
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {placingOrder ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle2
                  size={18}
                />

                Place Order
              </>
            )}

          </button>

          {/* Address warning */}

          {selectedAddressId ===
            null &&
            addresses.length > 0 && (
              <p className="mt-3 text-center text-xs leading-5 text-amber-600">
                Please select a shipping address.
              </p>
            )}

          {/* No address warning */}

          {addresses.length === 0 && (
            <p className="mt-3 text-center text-xs leading-5 text-amber-600">
              Add a shipping address before placing your order.
            </p>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            By placing this order, you confirm that
            the items and quantities above are correct.
          </p>

        </aside>

      </div>

    </div>
  );
}