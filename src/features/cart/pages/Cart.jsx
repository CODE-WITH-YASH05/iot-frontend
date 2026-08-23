import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ImageWithFallback from "../../../components/ImageWithFallback";

import useCart from "../hooks/useCart";
import { useProduct } from "../../products/hooks/useProduct";

// ==========================================================
// PRODUCT IMAGE
// ==========================================================

function CartProductImage({ slug, productName, className = "" }) {
  const { product, isLoading, isError } = useProduct(slug);

  // --------------------------------------------------------
  // PRODUCT IMAGE FIND
  // --------------------------------------------------------

  const getProductImage = () => {
    if (!product) {
      return null;
    }

    // Most common field
    if (product.image) {
      return product.image;
    }

    // Other possible API fields
    if (product.product_image) {
      return product.product_image;
    }

    if (product.primary_image) {
      return product.primary_image;
    }

    if (product.image_url) {
      return product.image_url;
    }

    if (product.thumbnail) {
      return product.thumbnail;
    }

    // If API returns images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      return (
        firstImage?.image || firstImage?.image_url || firstImage?.url || null
      );
    }

    return null;
  };

  const image = getProductImage();

  // --------------------------------------------------------
  // LOADING
  // --------------------------------------------------------

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-7 h-7 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  // --------------------------------------------------------
  // NO IMAGE
  // --------------------------------------------------------

  if (isError || !image) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-4xl">📦</span>
      </div>
    );
  }

  // --------------------------------------------------------
  // IMAGE
  // --------------------------------------------------------

  return (
    <ImageWithFallback
      src={image}
      alt={productName || "Product"}
      className={className}
    />
  );
}

// ==========================================================
// CART PAGE
// ==========================================================

export default function Cart() {
  const {
    items: cart,
    removeItem,
    updateItem,
    clear,
    cartTotal,
    cartCount,
    loading,
    actionLoading,
    error,
  } = useCart();

  // ========================================================
  // STATE
  // ========================================================

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // ========================================================
  // DEBUG
  // ========================================================

  console.log("CART ITEMS:", cart);

  // ========================================================
  // PROMO / SHIPPING
  // ========================================================

  const discount = promoApplied ? Math.round(cartTotal * 0.1) : 0;

  const shipping = cartTotal >= 999 ? 0 : 99;

  const finalTotal = cartTotal - discount + shipping;

  // ========================================================
  // PROMO APPLY
  // ========================================================

  const applyPromo = () => {
    const code = promoCode.trim().toLowerCase();

    if (code === "vigyaan10" || code === "welcome") {
      setPromoApplied(true);
    }
  };

  // ========================================================
  // REMOVE ITEM
  // ========================================================

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error("Remove cart item error:", err);
    }
  };

  // ========================================================
  // UPDATE QUANTITY
  // ========================================================

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  // ========================================================
  // CLEAR CART
  // ========================================================

  const handleClearCart = async () => {
    try {
      await clear();

      setShowConfirmClear(false);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />

            <p className="mt-5 text-gray-500 font-medium">
              Loading your cart...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (error && !cart.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-red-400">
                error
              </span>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Unable to Load Cart
            </h2>

            <p className="text-gray-500 mb-6">
              Something went wrong while loading your cart.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // EMPTY CART
  // ========================================================

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />

        <div className="flex-grow flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-center max-w-lg"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            >
              <span className="material-symbols-outlined text-6xl text-indigo-400">
                shopping_cart
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Your Cart is Empty
            </h2>

            <p className="text-gray-500 text-lg mb-8">
              Discover amazing IoT devices and add them to your cart!
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/40 transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined">explore</span>
              Explore Products
            </Link>
          </motion.div>
        </div>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // MAIN CART
  // ========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-medium mb-6">
              {[
                {
                  step: 1,
                  label: "Cart",
                  active: true,
                },
                {
                  step: 2,
                  label: "Checkout",
                  active: false,
                },
                {
                  step: 3,
                  label: "Confirmation",
                  active: false,
                },
              ].map((s, i) => (
                <React.Fragment key={s.step}>
                  <div
                    className={`flex items-center gap-2 ${
                      s.active ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        s.active
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {s.step}
                    </span>

                    <span className="hidden sm:inline">{s.label}</span>
                  </div>

                  {i < 2 && <div className="w-8 md:w-12 h-px bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 text-center">
              Shopping Cart
              <span className="text-gray-300 text-xl md:text-2xl font-normal ml-3">
                ({cartCount} {cartCount === 1 ? "item" : "items"})
              </span>
            </h1>
          </motion.div>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {typeof error === "string"
                ? error
                : "Unable to perform cart operation."}
            </div>
          )}

          {/* ================================================= */}
          {/* MAIN GRID */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ================================================= */}
            {/* CART ITEMS */}
            {/* ================================================= */}

            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => {
                  const originalPrice = Number(item.product_price || 0);

                  const discountPrice =
                    item.product_discount_price !== null &&
                    item.product_discount_price !== undefined
                      ? Number(item.product_discount_price)
                      : null;

                  const currentPrice =
                    discountPrice !== null ? discountPrice : originalPrice;

                  const lineTotal = Number(item.line_total || 0);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -50,
                        height: 0,
                        marginBottom: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                      }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all group overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row gap-5 p-5 md:p-6">
                        {/* ================================= */}
                        {/* PRODUCT IMAGE */}
                        {/* ================================= */}

                        <Link
                          to={`/product/${item.product_slug}`}
                          className="flex-shrink-0 mx-auto sm:mx-0 relative"
                        >
                          <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-indigo-200 transition-all">
                            <CartProductImage
                              slug={item.product_slug}
                              productName={item.product_name}
                              className="w-20 h-20 md:w-24 md:h-24 object-contain"
                            />
                          </div>
                        </Link>

                        {/* ================================= */}
                        {/* PRODUCT INFO */}
                        {/* ================================= */}

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <Link to={`/product/${item.product_slug}`}>
                                <h3 className="text-sm md:text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                                  {item.product_name}
                                </h3>
                              </Link>

                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                Vigyaan
                                {" • "}
                                In Stock
                              </p>
                            </div>
                          </div>

                          {/* ================================= */}
                          {/* BOTTOM */}
                          {/* ================================= */}

                          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-4">
                            {/* QUANTITY */}

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-medium">
                                Qty
                              </span>

                              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-0.5">
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1,
                                    )
                                  }
                                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  −
                                </button>

                                <span className="w-8 md:w-10 text-center text-sm font-bold text-gray-900">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* PRICE */}

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg md:text-xl font-black text-gray-900">
                                  ₹{lineTotal.toLocaleString("en-IN")}
                                </p>

                                <div className="flex items-center justify-end gap-2">
                                  {discountPrice !== null &&
                                    discountPrice < originalPrice && (
                                      <p className="text-xs text-gray-400 line-through">
                                        ₹{originalPrice.toLocaleString("en-IN")}
                                      </p>
                                    )}

                                  {item.quantity > 1 && (
                                    <p className="text-xs text-gray-400">
                                      ₹{currentPrice.toLocaleString("en-IN")}{" "}
                                      each
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleRemoveItem(item.id)}
                                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-40"
                                title="Remove item"
                              >
                                <span className="material-symbols-outlined text-xl">
                                  delete_outline
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* ================================================= */}
              {/* ACTIONS */}
              {/* ================================================= */}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Link
                  to="/shop"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors group"
                >
                  <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                  Continue Shopping
                </Link>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowConfirmClear(true)}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-medium transition-colors disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete_sweep
                  </span>
                  Clear All Items
                </button>
              </div>

              {/* ================================================= */}
              {/* CLEAR MODAL */}
              {/* ================================================= */}

              <AnimatePresence>
                {showConfirmClear && (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{
                        scale: 0.9,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      exit={{
                        scale: 0.9,
                      }}
                      className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
                    >
                      <span className="material-symbols-outlined text-5xl text-red-400 mb-4">
                        warning
                      </span>

                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        Clear Cart?
                      </h3>

                      <p className="text-gray-500 text-sm mb-6">
                        Are you sure you want to remove all items from your
                        cart?
                      </p>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowConfirmClear(false)}
                          className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={handleClearCart}
                          className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {actionLoading ? "Clearing..." : "Yes, Clear All"}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ================================================= */}
            {/* ORDER SUMMARY */}
            {/* ================================================= */}

            <div className="lg:col-span-1">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg sticky top-28"
              >
                {/* SUMMARY HEADER */}

                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">
                      receipt_long
                    </span>
                    Order Summary
                  </h3>
                </div>

                {/* PRICE DETAILS */}

                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"}
                      )
                    </span>

                    <span className="text-gray-900 font-bold">
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>

                    {shipping === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      <span className="text-gray-900 font-bold">
                        ₹{shipping.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount (10%)</span>

                      <span className="text-green-600 font-bold">
                        -₹
                        {discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {shipping > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        info
                      </span>
                      Add ₹
                      {Math.max(0, 999 - cartTotal).toLocaleString("en-IN")}{" "}
                      more for free shipping!
                    </div>
                  )}
                </div>

                {/* PROMO */}

                <div className="px-6 pb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        confirmation_number
                      </span>

                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                        className={`w-full pl-10 pr-3 py-3 bg-gray-50 border rounded-xl text-sm font-medium placeholder-gray-400 focus:outline-none transition-all ${
                          promoApplied
                            ? "border-green-300 bg-green-50 text-green-700"
                            : "border-gray-200 focus:border-indigo-400 text-gray-900"
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        promoApplied
                          ? () => {
                              setPromoApplied(false);
                              setPromoCode("");
                            }
                          : applyPromo
                      }
                      className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                        promoApplied
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {promoApplied ? "Remove" : "Apply"}
                    </button>
                  </div>

                  {promoApplied && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>
                      Promo applied! 10% off
                    </p>
                  )}

                  {!promoApplied && (
                    <p className="text-xs text-gray-400 mt-2">
                      Try:{" "}
                      <button
                        type="button"
                        onClick={() => setPromoCode("VIGYAAN10")}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        VIGYAAN10
                      </button>{" "}
                      or{" "}
                      <button
                        type="button"
                        onClick={() => setPromoCode("WELCOME")}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        WELCOME
                      </button>
                    </p>
                  )}
                </div>

                {/* TOTAL */}

                <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                  <div className="flex justify-between items-baseline mb-5">
                    <span className="text-base font-bold text-gray-900">
                      Total Amount
                    </span>

                    <div className="text-right">
                      <span className="text-2xl md:text-3xl font-black text-indigo-600">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </span>

                      {discount > 0 && (
                        <p className="text-xs text-green-600 font-medium">
                          You save ₹{discount.toLocaleString("en-IN")}!
                        </p>
                      )}
                    </div>
                  </div>

                  <Link to="/checkout" className="block">
                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">lock</span>
                      Secure Checkout
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </motion.button>
                  </Link>
                </div>

                {/* TRUST */}

                <div className="px-6 pb-6">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">🔒</span>
                      SSL Encrypted
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <span className="text-green-500">✓</span>
                      Secure Payment
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-2xl">
                    {["💳", "📱", "🏦", "💰", "🔵"].map((icon, i) => (
                      <span
                        key={i}
                        className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
