import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ImageWithFallback from "../../../components/ImageWithFallback";

import useOrders from "../hooks/useOrders";
import useReview from "../../reviews/hooks/useReviews";
import { productApi } from "../../products/api/product.api";

// ==========================================================
// PRODUCT IMAGE HELPER
// ==========================================================

function getProductImage(product) {
  if (!product) return null;

  // Direct image fields
  if (product.image) return product.image;
  if (product.product_image) return product.product_image;
  if (product.primary_image) return product.primary_image;
  if (product.image_url) return product.image_url;
  if (product.thumbnail) return product.thumbnail;
  if (product.thumbnail_url) return product.thumbnail_url;

  // Nested image object
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
    if (typeof firstImage === "string") return firstImage;
    if (firstImage && typeof firstImage === "object") {
      return (
        firstImage.image ||
        firstImage.image_url ||
        firstImage.url ||
        firstImage.src ||
        firstImage.file ||
        null
      );
    }
  }

  // Gallery array
  if (Array.isArray(product.gallery) && product.gallery.length > 0) {
    const firstImage = product.gallery[0];
    if (typeof firstImage === "string") return firstImage;
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
// STATUS BADGE
// ==========================================================

function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    processing: {
      label: "Processing",
      className: "bg-purple-100 text-purple-700 border-purple-200",
    },
    shipped: {
      label: "Shipped",
      className: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    delivered: {
      label: "Delivered",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-700 border-red-200",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    label: status || "Unknown",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status?.toLowerCase() === "pending"
            ? "bg-yellow-500"
            : status?.toLowerCase() === "confirmed"
              ? "bg-blue-500"
              : status?.toLowerCase() === "processing"
                ? "bg-purple-500"
                : status?.toLowerCase() === "shipped"
                  ? "bg-indigo-500"
                  : status?.toLowerCase() === "delivered"
                    ? "bg-green-500"
                    : status?.toLowerCase() === "cancelled"
                      ? "bg-red-500"
                      : "bg-gray-500"
        }`}
      />
      {config.label}
    </span>
  );
}

// ==========================================================
// ORDER ITEM IMAGE
// ==========================================================

function OrderItemImage({ product, productName }) {
  const image = getProductImage(product);

  // Build full URL
  const getFullImageUrl = (img) => {
    if (!img) return null;
    if (
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("data:")
    ) {
      return img;
    }
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
    return `${baseUrl.replace(/\/$/, "")}/${img.replace(/^\//, "")}`;
  };

  const imageUrl = getFullImageUrl(image);

  if (!imageUrl) {
    return (
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200 flex-shrink-0">
        <span className="text-3xl md:text-4xl">📦</span>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
      <ImageWithFallback
        src={imageUrl}
        alt={productName || "Product"}
        className="w-16 h-16 md:w-20 md:h-20 object-contain"
      />
    </div>
  );
}

// ==========================================================
// ORDER STATUS TIMELINE
// ==========================================================

function OrderTimeline({ history, currentStatus }) {
  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  if (currentStatus === "cancelled") {
    return (
      <div className="flex gap-4 p-4 bg-red-50 rounded-2xl border border-red-200">
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined">close</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Order Cancelled</h3>
          <p className="text-sm text-gray-500 mt-1">
            This order has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {statuses.map((status, index) => {
        const completed = index <= currentIndex;
        const historyItem = history?.find((item) => item.new_status === status);

        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  completed
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {completed ? (
                  <span className="material-symbols-outlined text-lg">
                    check
                  </span>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {index < statuses.length - 1 && (
                <div
                  className={`w-px h-12 ${completed ? "bg-indigo-300" : "bg-gray-200"}`}
                />
              )}
            </div>
            <div className="pt-1 pb-5">
              <h3
                className={`font-bold capitalize ${completed ? "text-gray-900" : "text-gray-400"}`}
              >
                {status}
              </h3>
              {historyItem?.created_at && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(historyItem.created_at).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================================
// REVIEW SECTION
// ==========================================================

function ReviewSection({ reviews, onEdit, onDelete, isOwner, loading }) {
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleExpand = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl block mb-2">📝</span>
        <p className="text-sm text-gray-400">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isExpanded = expandedReviews[review.id] || false;
        const shouldTruncate = review.comment?.length > 150;

        return (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                  {getInitials(review.user_name || review.user?.name)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {review.user_name || review.user?.name || "Anonymous"}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-sm">
                            {star <= review.rating ? "⭐" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit(review)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit review"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => onDelete(review.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete review"
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {review.title && (
                  <h5 className="text-sm font-semibold text-gray-800 mt-1">
                    {review.title}
                  </h5>
                )}

                <p
                  className={`text-sm text-gray-600 mt-1 leading-relaxed ${!isExpanded && shouldTruncate ? "line-clamp-3" : ""}`}
                >
                  {review.comment}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => toggleExpand(review.id)}
                    className="text-xs text-indigo-600 font-medium hover:text-indigo-700 mt-1"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}

                {review.is_verified_purchase && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-green-500 text-sm">
                      verified
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      Verified Purchase
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ==========================================================
// MAIN ORDER DETAIL
// ==========================================================

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // ========================================================
  // ORDERS HOOK
  // ========================================================

  const {
    selectedOrder,
    orderHistory,
    detailLoading,
    historyLoading,
    actionLoading,
    error,
    fetchOrder,
    fetchOrderHistory,
    cancelOrder,
    clearSelectedOrder,
  } = useOrders({ autoFetch: false });

  // ========================================================
  // REVIEWS HOOK
  // ========================================================

  const {
    reviews,
    loading: reviewsLoading,
    createReview,
    updateReview,
    deleteReview,
    fetchProductReviews,
  } = useReview();

  // ========================================================
  // PRODUCTS STATE
  // ========================================================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // ========================================================
  // REVIEW FORM STATE
  // ========================================================

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductSlug, setSelectedProductSlug] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [reviewFormErrors, setReviewFormErrors] = useState({});

  // ========================================================
  // CANCEL MODAL
  // ========================================================

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // ========================================================
  // FETCH PRODUCTS
  // ========================================================

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const response = await productApi.getProducts();
      const responseData = response?.data;
      const productData = responseData?.data ?? responseData;
      let productArray = [];

      if (Array.isArray(productData)) {
        productArray = productData;
      } else if (Array.isArray(productData?.results)) {
        productArray = productData.results;
      } else if (Array.isArray(productData?.products)) {
        productArray = productData.products;
      }

      setProducts(productArray);
    } catch (err) {
      console.error("ORDER DETAIL PRODUCTS ERROR:", err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // ========================================================
  // FETCH ORDER + HISTORY + PRODUCTS
  // ========================================================

  useEffect(() => {
    if (!orderId) return;

    fetchOrder(orderId);
    fetchOrderHistory(orderId);
    fetchProducts();

    return () => {
      clearSelectedOrder();
    };
  }, [
    orderId,
    fetchOrder,
    fetchOrderHistory,
    fetchProducts,
    clearSelectedOrder,
  ]);

  // ========================================================
  // MATCH ORDER ITEM WITH PRODUCT
  // ========================================================

  const getMatchedProduct = useCallback(
    (orderItem) => {
      if (!orderItem) return null;
      const matched = products.find(
        (product) => String(product.id) === String(orderItem.product),
      );
      return matched || null;
    },
    [products],
  );

  // ========================================================
  // CHECK IF USER CAN REVIEW
  // ========================================================

  const canReview = (orderItem) => {
    if (selectedOrder?.status?.toLowerCase() !== "delivered") return false;

    const productId = orderItem.product;
    const hasReviewed = reviews.some(
      (review) => String(review.product) === String(productId),
    );

    return !hasReviewed;
  };

  // ========================================================
  // HANDLE REVIEW ACTIONS
  // ========================================================

  const handleOpenReviewForm = (orderItem) => {
    const matchedProduct = getMatchedProduct(orderItem);
    if (!matchedProduct) {
      toast.error("Product not found");
      return;
    }

    setSelectedProductId(orderItem.product);
    setSelectedProductSlug(matchedProduct.slug);
    setSelectedProductName(orderItem.product_name);
    setEditingReview(null);
    setReviewFormData({ rating: 5, title: "", comment: "" });
    setReviewFormErrors({});
    setShowReviewForm(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewFormData({
      rating: review.rating || 5,
      title: review.title || "",
      comment: review.comment || "",
    });
    setReviewFormErrors({});
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    await deleteReview(reviewId, selectedProductSlug);
    toast.success("Review deleted successfully!");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewFormErrors({});

    // Validate
    const errors = {};
    if (
      !reviewFormData.rating ||
      reviewFormData.rating < 1 ||
      reviewFormData.rating > 5
    ) {
      errors.rating = "Please select a rating";
    }
    if (!reviewFormData.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!reviewFormData.comment?.trim()) {
      errors.comment = "Comment is required";
    }

    if (Object.keys(errors).length > 0) {
      setReviewFormErrors(errors);
      return;
    }

    setSubmittingReview(true);
    try {
      const data = {
        rating: reviewFormData.rating,
        title: reviewFormData.title.trim(),
        comment: reviewFormData.comment.trim(),
      };

      if (editingReview) {
        await updateReview(editingReview.id, data, selectedProductSlug);
        toast.success("Review updated successfully! ✏️");
      } else {
        await createReview(selectedProductSlug, data);
        toast.success("Review submitted successfully! 🎉");
      }

      setShowReviewForm(false);
      setEditingReview(null);
      setReviewFormData({ rating: 5, title: "", comment: "" });
    } catch (err) {
      console.error("Review submission error:", err);
      toast.error(err?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const cancelReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewFormData({ rating: 5, title: "", comment: "" });
    setReviewFormErrors({});
  };

  // ========================================================
  // CANCEL ORDER
  // ========================================================

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(orderId);
      setShowCancelConfirm(false);
      await fetchOrder(orderId);
      await fetchOrderHistory(orderId);
      toast.success("Order cancelled successfully!");
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err?.message || "Failed to cancel order");
    }
  };

  // ========================================================
  // GET REVIEWS FOR PRODUCT
  // ========================================================

  const getProductReviews = (productId) => {
    return reviews.filter((r) => String(r.product) === String(productId));
  };

  // ========================================================
  // CHECK IF USER IS REVIEW OWNER
  // ========================================================

  const isReviewOwner = (review) => {
    // This would need the current user ID from context
    // For now, we'll assume the user can edit their own reviews
    // You can implement proper user check with your auth system
    return true; // Placeholder - implement with actual user check
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (detailLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="mt-5 text-gray-500 font-medium">
              Loading order details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ========================================================
  // ORDER NOT FOUND
  // ========================================================

  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📦</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              Order Not Found
            </h1>
            <p className="text-gray-500 mt-2">
              {error || "We could not find this order."}
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ========================================================
  // ORDER DATA
  // ========================================================

  const {
    id,
    status,
    subtotal,
    discount_amount,
    shipping_amount,
    tax_amount,
    total_amount,
    items = [],
    created_at,
  } = selectedOrder;

  const canCancel = status?.toLowerCase() === "pending";
  const isDelivered = status?.toLowerCase() === "delivered";

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-5"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              Back to Orders
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                  Order ID
                </p>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 break-all">
                  #{id?.slice(0, 8)}
                </h1>
                {created_at && (
                  <p className="text-sm text-gray-400 mt-2">
                    Placed on {new Date(created_at).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <StatusBadge status={status} />
            </div>
          </motion.div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* ORDER ITEMS */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h2 className="text-xl font-black text-gray-900">
                    Order Items
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {items.length} {items.length === 1 ? "product" : "products"}
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const matchedProduct = getMatchedProduct(item);
                    const productReviews = getProductReviews(item.product);
                    const hasReview = productReviews.length > 0;
                    const canWriteReview = canReview(item);

                    return (
                      <div key={item.id} className="p-5 md:p-6">
                        <div className="flex gap-4">
                          {/* IMAGE */}
                          <OrderItemImage
                            product={matchedProduct}
                            productName={item.product_name}
                          />

                          {/* PRODUCT INFO */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-gray-900">
                              {item.product_name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                              ID: {item.product}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                              <span className="text-gray-500">
                                Qty:{" "}
                                <strong className="text-gray-900">
                                  {item.quantity}
                                </strong>
                              </span>
                              <span className="text-gray-500">
                                ₹
                                {Number(item.unit_price || 0).toLocaleString(
                                  "en-IN",
                                )}{" "}
                                each
                              </span>
                            </div>

                            {Number(item.discount_amount || 0) > 0 && (
                              <p className="text-xs text-green-600 mt-2 font-medium">
                                Discount: -₹
                                {Number(item.discount_amount).toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                            )}

                            {/* REVIEW BUTTON */}
                            {isDelivered && (
                              <div className="mt-4">
                                {canWriteReview ? (
                                  <button
                                    onClick={() => handleOpenReviewForm(item)}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      rate_review
                                    </span>
                                    Write Review
                                  </button>
                                ) : hasReview ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                      <span className="material-symbols-outlined text-base">
                                        check_circle
                                      </span>
                                      Reviewed ✓
                                    </span>
                                    <button
                                      onClick={() => {
                                        const review = productReviews[0];
                                        handleEditReview(review);
                                      }}
                                      className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        const review = productReviews[0];
                                        handleDeleteReview(review.id);
                                      }}
                                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* ITEM TOTAL */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-black text-indigo-600">
                              ₹
                              {Number(item.total_price || 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>

                        {/* REVIEW SECTION FOR THIS PRODUCT */}
                        {isDelivered && productReviews.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-indigo-600 text-base">
                                rate_review
                              </span>
                              Your Review
                            </h4>
                            <ReviewSection
                              reviews={productReviews}
                              onEdit={handleEditReview}
                              onDelete={handleDeleteReview}
                              isOwner={isReviewOwner}
                              loading={reviewsLoading}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.section>

              {/* ORDER STATUS TIMELINE */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="mb-7">
                  <h2 className="text-xl font-black text-gray-900">
                    Order Status
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Track your order progress.
                  </p>
                </div>

                {historyLoading ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-400 mt-3">
                      Loading status history...
                    </p>
                  </div>
                ) : (
                  <OrderTimeline
                    history={orderHistory}
                    currentStatus={status}
                  />
                )}
              </motion.section>

              {/* REVIEW FORM */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h3 className="text-lg font-black text-gray-900 mb-4">
                        {editingReview ? "Edit Your Review" : "Write a Review"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {selectedProductName && `For: ${selectedProductName}`}
                      </p>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rating *
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setReviewFormData({
                                    ...reviewFormData,
                                    rating: star,
                                  })
                                }
                                className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                              >
                                {star <= reviewFormData.rating ? "⭐" : "☆"}
                              </button>
                            ))}
                          </div>
                          {reviewFormErrors.rating && (
                            <p className="text-xs text-red-500 mt-1">
                              {reviewFormErrors.rating}
                            </p>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Review Title *
                          </label>
                          <input
                            type="text"
                            value={reviewFormData.title}
                            onChange={(e) =>
                              setReviewFormData({
                                ...reviewFormData,
                                title: e.target.value,
                              })
                            }
                            placeholder="Summarize your experience"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:bg-white focus:outline-none transition-all"
                          />
                          {reviewFormErrors.title && (
                            <p className="text-xs text-red-500 mt-1">
                              {reviewFormErrors.title}
                            </p>
                          )}
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Review Comment *
                          </label>
                          <textarea
                            value={reviewFormData.comment}
                            onChange={(e) =>
                              setReviewFormData({
                                ...reviewFormData,
                                comment: e.target.value,
                              })
                            }
                            placeholder="Share your detailed experience..."
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:bg-white focus:outline-none transition-all resize-none"
                          />
                          {reviewFormErrors.comment && (
                            <p className="text-xs text-red-500 mt-1">
                              {reviewFormErrors.comment}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={cancelReviewForm}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {submittingReview ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                {editingReview
                                  ? "Updating..."
                                  : "Submitting..."}
                              </>
                            ) : editingReview ? (
                              "Update Review"
                            ) : (
                              "Submit Review"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* ORDER SUMMARY */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <h2 className="text-xl font-black text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900">
                      ₹{Number(subtotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-bold text-green-600">
                      -₹{Number(discount_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold text-gray-900">
                      {Number(shipping_amount || 0) === 0
                        ? "FREE"
                        : `₹${Number(shipping_amount).toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-bold text-gray-900">
                      ₹{Number(tax_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-5 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="text-2xl font-black text-indigo-600">
                      ₹{Number(total_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </motion.section>

              {/* CANCEL ORDER */}
              {canCancel && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                >
                  <h3 className="font-black text-gray-900">Cancel Order</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    You can cancel this order while its status is pending.
                  </p>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full mt-5 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Cancelling..." : "Cancel Order"}
                  </button>
                </motion.section>
              )}

              {/* SUPPORT */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6"
              >
                <span className="material-symbols-outlined text-3xl text-indigo-600">
                  support_agent
                </span>
                <h3 className="font-black text-gray-900 mt-3">Need Help?</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Contact us if you have any questions about your order.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Contact Support <span className="ml-1">→</span>
                </Link>
              </motion.section>
            </div>
          </div>
        </div>
      </main>

      {/* CANCEL MODAL */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">
                warning
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mt-5">
              Cancel Order?
            </h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Are you sure you want to cancel this order?
            </p>
            <div className="flex gap-3 mt-7">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
              >
                No
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancelOrder}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {actionLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
