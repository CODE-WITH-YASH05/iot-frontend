import React, { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import useOrders from "../hooks/useOrders";
import { productApi } from "../../products/api/product.api";

// ==========================================================
// IMAGE URL HELPER
// ==========================================================

function getImageUrl(image) {
  if (!image) {
    return null;
  }

  if (typeof image !== "string") {
    return null;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  /*
   * Example:
   *
   * VITE_API_BASE_URL =
   * http://127.0.0.1:8000/api/v1
   *
   * Image:
   * /media/products/abc.jpg
   *
   * We need:
   * http://127.0.0.1:8000/media/products/abc.jpg
   */

  const serverBase = apiBase
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  if (image.startsWith("/")) {
    return `${serverBase}${image}`;
  }

  return `${serverBase}/${image}`;
}

// ==========================================================
// PRODUCT IMAGE EXTRACTOR
// ==========================================================

function getProductImage(product) {
  if (!product) {
    return null;
  }

  // Direct image fields
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

  if (typeof product.image === "string") {
    return product.image;
  }

  // Image object
  if (product.image && typeof product.image === "object") {
    return (
      product.image.url ||
      product.image.image ||
      product.image.image_url ||
      null
    );
  }

  // Images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    if (firstImage && typeof firstImage === "object") {
      return (
        firstImage.image ||
        firstImage.image_url ||
        firstImage.url ||
        firstImage.src ||
        null
      );
    }
  }

  return null;
}

// ==========================================================
// PRODUCT IMAGE
// ==========================================================

function ProductImage({ product, productName, className = "" }) {
  const image = getProductImage(product);

  const imageUrl = getImageUrl(image);

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <span className="text-2xl">📦</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={productName || "Product"}
      className={className}
      onError={(event) => {
        console.error("ORDER IMAGE ERROR:", imageUrl);

        event.currentTarget.style.display = "none";

        const parent = event.currentTarget.parentElement;

        if (parent) {
          parent.innerHTML = '<span class="text-2xl">📦</span>';
        }
      }}
    />
  );
}

// ==========================================================
// STATUS BADGE
// ==========================================================

function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      className: "bg-yellow-100 text-yellow-700",
      icon: "⏳",
      label: "Pending",
    },

    confirmed: {
      className: "bg-blue-100 text-blue-700",
      icon: "✓",
      label: "Confirmed",
    },

    processing: {
      className: "bg-purple-100 text-purple-700",
      icon: "⚙️",
      label: "Processing",
    },

    shipped: {
      className: "bg-indigo-100 text-indigo-700",
      icon: "🚚",
      label: "Shipped",
    },

    delivered: {
      className: "bg-green-100 text-green-700",
      icon: "✓",
      label: "Delivered",
    },

    cancelled: {
      className: "bg-red-100 text-red-700",
      icon: "✕",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.className}`}
    >
      <span>{config.icon}</span>

      {config.label}
    </span>
  );
}

// ==========================================================
// ORDER ITEM PRICE
// ==========================================================

function getItemUnitPrice(item) {
  return Number(item?.unit_price ?? item?.price ?? 0);
}

function getItemTotal(item) {
  return Number(
    item?.total_price ??
      item?.total ??
      Number(item?.unit_price ?? 0) * Number(item?.quantity ?? 0),
  );
}

// ==========================================================
// ORDERS PAGE
// ==========================================================

export default function Orders() {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrder,
    selectedOrder,
    detailLoading,
  } = useOrders({
    autoFetch: false,
  });

  const [expandedOrder, setExpandedOrder] = useState(null);

  const [products, setProducts] = useState([]);

  const [productsLoading, setProductsLoading] = useState(false);

  // ========================================================
  // FETCH ORDERS
  // ========================================================

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ========================================================
  // FETCH PRODUCTS
  //
  // Used only to get product images.
  // Backend order data contains product UUID.
  // ========================================================

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);

        const response = await productApi.getProducts();

        const responseData = response?.data;

        const data = responseData?.data ?? responseData;

        let productArray = [];

        if (Array.isArray(data)) {
          productArray = data;
        } else if (Array.isArray(data?.results)) {
          productArray = data.results;
        } else if (Array.isArray(data?.products)) {
          productArray = data.products;
        }

        console.log("ORDER PRODUCTS:", productArray);

        if (mounted) {
          setProducts(productArray);
        }
      } catch (err) {
        console.error("ORDER PRODUCT FETCH ERROR:", err);
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // ========================================================
  // PRODUCT MAP
  // ========================================================

  const productMap = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      if (product?.id) {
        map.set(String(product.id), product);
      }
    });

    return map;
  }, [products]);

  // ========================================================
  // GET PRODUCT FROM ORDER ITEM
  // ========================================================

  const getOrderProduct = (item) => {
    if (!item) {
      return null;
    }

    // Sometimes serializer returns object
    if (item.product && typeof item.product === "object") {
      return item.product;
    }

    // Normal case: UUID
    if (item.product) {
      return productMap.get(String(item.product));
    }

    return null;
  };

  // ========================================================
  // TOGGLE ORDER
  // ========================================================

  const toggleOrderExpand = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    try {
      console.log("FETCHING ORDER DETAIL:", orderId);

      const detail = await fetchOrder(orderId);

      console.log("ORDER DETAIL:", JSON.stringify(detail, null, 2));

      console.log("ORDER ITEMS:", detail?.items);
    } catch (err) {
      console.error("ORDER DETAIL ERROR:", err);
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
              Loading your orders...
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">⚠️</span>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Unable to Load Orders
            </h2>

            <p className="text-gray-500 mb-6">{error}</p>

            <button
              onClick={() => fetchOrders()}
              className="px-7 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
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
  // EMPTY
  // ========================================================

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📦</span>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-3">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mb-7">
              You haven't placed any orders yet.
            </p>

            <Link
              to="/shop"
              className="inline-flex px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold"
            >
              Start Shopping
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600 text-4xl">
                receipt_long
              </span>
              My Orders
            </h1>

            <p className="text-gray-500 mt-2">
              {orders.length} order
              {orders.length !== 1 ? "s" : ""} found
            </p>
          </motion.div>

          {/* ================================================= */}
          {/* ORDERS */}
          {/* ================================================= */}

          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order, index) => {
                const currentOrder =
                  selectedOrder?.id === order.id ? selectedOrder : order;

                const items = Array.isArray(currentOrder?.items)
                  ? currentOrder.items
                  : [];

                const isExpanded = expandedOrder === order.id;

                return (
                  <motion.div
                    key={order.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {/* ===================================== */}
                    {/* ORDER HEADER */}
                    {/* ===================================== */}

                    <button
                      type="button"
                      onClick={() => toggleOrderExpand(order.id)}
                      className="w-full text-left p-5 md:p-6 hover:bg-gray-50/70 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <span className="text-2xl">🛍️</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-gray-900">
                                Order #{String(order.id).slice(0, 8)}
                              </h3>

                              <OrderStatusBadge status={order.status} />
                            </div>

                            <p className="text-sm text-gray-400 mt-1">
                              {order.created_at
                                ? format(
                                    new Date(order.created_at),
                                    "PPP 'at' p",
                                  )
                                : "Date unavailable"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 ml-auto">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Total</p>

                            <p className="text-lg font-black text-indigo-600">
                              ₹
                              {Number(order.total_amount || 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-400">Items</p>

                            <p className="font-bold text-gray-900">
                              {isExpanded
                                ? items.length
                                : (order.item_count ??
                                  order.items?.length ??
                                  0)}
                            </p>
                          </div>

                          <span className="material-symbols-outlined text-gray-400">
                            {isExpanded ? "expand_less" : "expand_more"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* ===================================== */}
                    {/* DETAILS */}
                    {/* ===================================== */}

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-100 p-5 md:p-6">
                            {/* LOADING */}

                            {detailLoading && selectedOrder?.id === order.id ? (
                              <div className="py-10 flex items-center justify-center">
                                <div className="flex items-center gap-3 text-gray-500">
                                  <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                  Loading order details...
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* ================================= */}
                                {/* ITEMS */}
                                {/* ================================= */}

                                <div>
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <h4 className="text-lg font-black text-gray-900">
                                        Order Items
                                      </h4>

                                      <p className="text-sm text-gray-400">
                                        {items.length} product
                                        {items.length !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>

                                  {items.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400">
                                      No order items found.
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {items.map((item) => {
                                        const product = getOrderProduct(item);

                                        const unitPrice =
                                          getItemUnitPrice(item);

                                        const total = getItemTotal(item);

                                        const image = getProductImage(product);

                                        console.log("ORDER ITEM:", item);

                                        console.log("ORDER PRODUCT:", product);

                                        console.log(
                                          "ORDER IMAGE:",
                                          getImageUrl(image),
                                        );

                                        return (
                                          <div
                                            key={item.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                                          >
                                            {/* IMAGE */}

                                            <div className="w-20 h-20 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                              <ProductImage
                                                product={product}
                                                productName={item.product_name}
                                                className="w-16 h-16 object-contain"
                                              />
                                            </div>

                                            {/* INFO */}

                                            <div className="flex-1 min-w-0">
                                              <Link
                                                to={
                                                  product?.slug
                                                    ? `/product/${product.slug}`
                                                    : "#"
                                                }
                                                onClick={(e) => {
                                                  if (!product?.slug) {
                                                    e.preventDefault();
                                                  }
                                                }}
                                              >
                                                <h5 className="font-bold text-gray-900 hover:text-indigo-600 transition line-clamp-2">
                                                  {item.product_name}
                                                </h5>
                                              </Link>

                                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                                <span className="text-gray-500">
                                                  Qty:{" "}
                                                  <strong className="text-gray-900">
                                                    {item.quantity}
                                                  </strong>
                                                </span>

                                                <span className="text-gray-300">
                                                  •
                                                </span>

                                                <span className="text-gray-500">
                                                  ₹
                                                  {unitPrice.toLocaleString(
                                                    "en-IN",
                                                  )}{" "}
                                                  each
                                                </span>
                                              </div>
                                            </div>

                                            {/* TOTAL */}

                                            <div className="text-right flex-shrink-0">
                                              <p className="text-lg font-black text-gray-900">
                                                ₹{total.toLocaleString("en-IN")}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* ================================= */}
                                {/* SUMMARY */}
                                {/* ================================= */}

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                  <h4 className="text-lg font-black text-gray-900 mb-4">
                                    Order Summary
                                  </h4>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                      <p className="text-xs text-gray-400">
                                        Subtotal
                                      </p>

                                      <p className="font-black text-gray-900 mt-1">
                                        ₹
                                        {Number(
                                          currentOrder.subtotal || 0,
                                        ).toLocaleString("en-IN")}
                                      </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4">
                                      <p className="text-xs text-gray-400">
                                        Discount
                                      </p>

                                      <p className="font-black text-green-600 mt-1">
                                        -₹
                                        {Number(
                                          currentOrder.discount_amount || 0,
                                        ).toLocaleString("en-IN")}
                                      </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4">
                                      <p className="text-xs text-gray-400">
                                        Shipping
                                      </p>

                                      <p className="font-black text-gray-900 mt-1">
                                        {Number(
                                          currentOrder.shipping_amount || 0,
                                        ) === 0
                                          ? "FREE"
                                          : `₹${Number(
                                              currentOrder.shipping_amount,
                                            ).toLocaleString("en-IN")}`}
                                      </p>
                                    </div>

                                    <div className="bg-indigo-50 rounded-xl p-4">
                                      <p className="text-xs text-indigo-500">
                                        Total
                                      </p>

                                      <p className="font-black text-indigo-600 mt-1">
                                        ₹
                                        {Number(
                                          currentOrder.total_amount || 0,
                                        ).toLocaleString("en-IN")}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* ================================= */}
                                {/* ADDRESS */}
                                {/* ================================= */}

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                  <h4 className="text-lg font-black text-gray-900 mb-4">
                                    Delivery Address
                                  </h4>

                                  <div className="bg-gray-50 rounded-2xl p-5">
                                    <p className="font-bold text-gray-900">
                                      {currentOrder.address_name}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-2">
                                      {currentOrder.address_line1}
                                    </p>

                                    {currentOrder.address_line2 && (
                                      <p className="text-sm text-gray-600">
                                        {currentOrder.address_line2}
                                      </p>
                                    )}

                                    <p className="text-sm text-gray-600">
                                      {currentOrder.address_city},{" "}
                                      {currentOrder.address_state}{" "}
                                      {currentOrder.address_postal_code}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                      {currentOrder.address_country}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-2">
                                      📞 {currentOrder.address_phone}
                                    </p>
                                  </div>
                                </div>

                                {/* ================================= */}
                                {/* ACTIONS */}
                                {/* ================================= */}

                                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                                  <Link
                                    to={`/orders/${order.id}`}
                                    className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      visibility
                                    </span>
                                    View Full Details
                                  </Link>

                                  {order.status?.toLowerCase() ===
                                    "pending" && (
                                    <button
                                      type="button"
                                      className="px-5 py-3 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition"
                                    >
                                      Cancel Order
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ================================================= */}
          {/* STATS */}
          {/* ================================================= */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400">Total Orders</p>

              <p className="text-2xl font-black text-gray-900 mt-1">
                {orders.length}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400">Delivered</p>

              <p className="text-2xl font-black text-green-600 mt-1">
                {
                  orders.filter(
                    (item) => item.status?.toLowerCase() === "delivered",
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400">Pending</p>

              <p className="text-2xl font-black text-yellow-600 mt-1">
                {
                  orders.filter(
                    (item) => item.status?.toLowerCase() === "pending",
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400">In Transit</p>

              <p className="text-2xl font-black text-indigo-600 mt-1">
                {
                  orders.filter(
                    (item) =>
                      item.status?.toLowerCase() === "shipped" ||
                      item.status?.toLowerCase() === "processing",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
