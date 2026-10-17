import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  Package,
} from "lucide-react";

import { productService } from "../../services/productService";
import { cartService } from "../../services/cartService";

import type {
  Product,
} from "../../types/product";

export default function ProductDetailsPage() {
  const { id } = useParams<{
    id: string;
  }>();

  const [
    product,
    setProduct,
  ] = useState<Product | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<string | null>(
    null
  );

  const [
    addingToCart,
    setAddingToCart,
  ] = useState(false);

  const [
    addedToCart,
    setAddedToCart,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // =========================================================
  // LOAD PRODUCT
  // =========================================================

  useEffect(() => {
    const loadProduct =
      async () => {
        if (!id) {
          setError(
            "Product ID is missing."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          const productId =
            Number(id);

          if (
            Number.isNaN(productId)
          ) {
            throw new Error(
              "Invalid product ID."
            );
          }

          const data =
            await productService.getProductById(
              productId
            );

          setProduct(data);

          // =================================================
          // SELECT INITIAL IMAGE
          // =================================================

          if (
            data.images &&
            data.images.length > 0
          ) {
            setSelectedImage(
              data.images[0]
            );
          } else if (
            data.imageUrl
          ) {
            setSelectedImage(
              data.imageUrl
            );
          } else {
            setSelectedImage(null);
          }

        } catch (error: any) {
          const message =
            error?.response?.data?.detail ??
            error?.response?.data?.message ??
            error?.response?.data?.title ??
            error?.message ??
            "Unable to load product.";

          setError(message);
        } finally {
          setLoading(false);
        }
      };

    loadProduct();
  }, [id]);

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart =
    async () => {
      if (!product) {
        return;
      }

      if (product.stock <= 0) {
        return;
      }

      if (
        quantity > product.stock
      ) {
        setError(
          `Only ${product.stock} items are available.`
        );

        return;
      }

      try {
        setAddingToCart(true);
        setError("");
        setAddedToCart(false);

        await cartService.addItem(
          product.id,
          quantity
        );

        setAddedToCart(true);

        // Hide success message
        // after a short delay.
        setTimeout(() => {
          setAddedToCart(false);
        }, 2500);

      } catch (error: any) {
        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Unable to add product to cart.";

        setError(message);
      } finally {
        setAddingToCart(false);
      }
    };

  // =========================================================
  // QUANTITY
  // =========================================================

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(1, current - 1)
      );
    };

  const increaseQuantity =
    () => {
      if (!product) {
        return;
      }

      setQuantity(
        (current) =>
          Math.min(
            product.stock,
            current + 1
          )
      );
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="flex flex-col items-center gap-3 text-slate-500">

          <Loader2
            size={36}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading product...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR / PRODUCT NOT FOUND
  // =========================================================

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">

          <Package
            size={36}
            className="text-slate-400"
          />

        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Product not found
        </h1>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error ||
            "The product you're looking for could not be found."}
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={17} />

          Back to Products
        </Link>

      </div>
    );
  }

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================

  const images =
    product.images &&
    product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const hasStock =
    product.stock > 0;

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

      {/* =====================================================
          BACK
      ===================================================== */}

      <Link
        to="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />

        Back to Products
      </Link>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          PRODUCT
      ===================================================== */}

      <div className="grid gap-10 lg:grid-cols-2">

        {/* ===================================================
            LEFT - IMAGES
        =================================================== */}

        <div>

          {/* Main Image */}

          <div className="aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">

            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">

                <Package
                  size={80}
                  className="text-slate-300"
                />

              </div>
            )}

          </div>

          {/* Thumbnails */}

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">

              {images.map(
                (
                  image,
                  index
                ) => {

                  const selected =
                    selectedImage ===
                    image;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition ${
                        selected
                          ? "border-slate-900"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >

                      <img
                        src={image}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />

                    </button>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            RIGHT - PRODUCT INFORMATION
        =================================================== */}

        <div className="flex flex-col">

          {/* Category */}

          {product.categoryName && (
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {product.categoryName}
            </p>
          )}

          {/* Name */}

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>

          {/* Price */}

          <p className="mt-5 text-3xl font-bold text-slate-900">
            $
            {product.price.toFixed(2)}
          </p>

          {/* Stock */}

          <div className="mt-5">

            {hasStock ? (
              <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">

                <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />

                {product.stock} in stock

              </div>
            ) : (
              <div className="inline-flex items-center rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">

                <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />

                Out of stock

              </div>
            )}

          </div>

          {/* Description */}

          {product.description && (
            <div className="mt-8">

              <h2 className="text-lg font-semibold text-slate-900">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                {product.description}
              </p>

            </div>
          )}

          {/* Divider */}

          <div className="my-8 h-px bg-slate-200" />

          {/* Add to cart */}

          {hasStock && (
            <div>

              <div className="flex flex-wrap items-center gap-4">

                {/* Quantity */}

                <div className="flex items-center rounded-xl border border-slate-300">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus
                      size={18}
                    />
                  </button>

                  <span className="flex h-12 min-w-12 items-center justify-center border-x border-slate-300 px-4 text-sm font-semibold text-slate-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      product.stock
                    }
                    className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus
                      size={18}
                    />
                  </button>

                </div>

                {/* Add */}

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    addingToCart
                  }
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >

                  {addingToCart ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart
                        size={18}
                      />

                      Add to Cart
                    </>
                  )}

                </button>

              </div>

              {/* Success */}

              {addedToCart && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                    ✓
                  </span>

                  Product added to your cart.

                </div>
              )}

              {/* Cart link */}

              {addedToCart && (
                <Link
                  to="/cart"
                  className="mt-4 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-950"
                >
                  View Cart →
                </Link>
              )}

            </div>
          )}

          {/* Out of stock */}

          {!hasStock && (
            <div className="rounded-xl bg-slate-100 px-5 py-4 text-center text-sm font-medium text-slate-500">
              This product is currently unavailable.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}