import React, { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  Star,
  Trash2,
  Eye,
  X,
  CheckCircle,
  XCircle,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import { useReviews } from "../hooks/useReviews";

export default function AdminReviews() {
  const { reviews, isLoading, isDeleting, error, fetchReviews, deleteReview } =
    useReviews();

  const [search, setSearch] = useState("");

  const [selectedReview, setSelectedReview] = useState(null);

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /**
   * Search + filter
   */
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        review?.product_name?.toLowerCase().includes(searchText) ||
        review?.user_name?.toLowerCase().includes(searchText) ||
        review?.title?.toLowerCase().includes(searchText) ||
        review?.comment?.toLowerCase().includes(searchText);

      let matchesFilter = true;

      if (filter === "approved") {
        matchesFilter = review.is_approved === true;
      }

      if (filter === "pending") {
        matchesFilter = review.is_approved === false;
      }

      if (filter === "verified") {
        matchesFilter = review.is_verified_purchase === true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [reviews, search, filter]);

  /**
   * Delete confirmation
   */
  const handleDelete = async (review) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) {
      return;
    }

    const result = await deleteReview(review.id);

    if (!result.success) {
      alert(result.error);
    }

    if (selectedReview?.id === review.id) {
      setSelectedReview(null);
    }
  };

  /**
   * Statistics
   */
  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter((review) => review.is_approved).length;

  const pendingReviews = reviews.filter((review) => !review.is_approved).length;

  const verifiedReviews = reviews.filter(
    (review) => review.is_verified_purchase,
  ).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Reviews
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage customer product reviews
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare size={22} />}
          title="Total Reviews"
          value={totalReviews}
        />

        <StatCard
          icon={<CheckCircle size={22} />}
          title="Approved"
          value={approvedReviews}
        />

        <StatCard
          icon={<XCircle size={22} />}
          title="Pending"
          value={pendingReviews}
        />

        <StatCard
          icon={<ShieldCheck size={22} />}
          title="Verified"
          value={verifiedReviews}
        />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, user or review..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* FILTER */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Reviews</option>

            <option value="approved">Approved</option>

            <option value="pending">Pending</option>

            <option value="verified">Verified Purchase</option>
          </select>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : filteredReviews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                onView={() => setSelectedReview(review)}
                onDelete={() => handleDelete(review)}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedReview && (
          <ReviewModal
            review={selectedReview}
            onClose={() => setSelectedReview(null)}
            onDelete={() => handleDelete(selectedReview)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        </div>

        <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW ROW
========================================================= */

function ReviewRow({ review, onView, onDelete, isDeleting }) {
  return (
    <div className="p-5 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* USER */}
        <div className="lg:w-48">
          <p className="font-bold text-gray-900">
            {review.user_name || "Customer"}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {review.created_at
              ? new Date(review.created_at).toLocaleDateString()
              : ""}
          </p>
        </div>

        {/* REVIEW */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900">{review.title}</p>

            {review.is_verified_purchase && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ShieldCheck size={13} />
                Verified
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {review.comment}
          </p>

          <p className="text-xs text-indigo-600 font-semibold mt-2">
            {review.product_name || "Product"}
          </p>
        </div>

        {/* RATING */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={17}
              className={
                star <= Number(review.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
        </div>

        {/* STATUS */}
        <div>
          {review.is_approved ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} />
              Approved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
              <XCircle size={14} />
              Pending
            </span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600"
            title="View"
          >
            <Eye size={17} />
          </button>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW MODAL
========================================================= */

function ReviewModal({ review, onClose, onDelete }) {
  return (
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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-black text-gray-900">Review Details</h2>

            <p className="text-sm text-gray-500">Customer review information</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {/* PRODUCT */}
          <div className="p-4 rounded-xl bg-indigo-50">
            <p className="text-xs text-indigo-500 font-semibold">PRODUCT</p>

            <p className="font-bold text-gray-900 mt-1">
              {review.product_name || "Product"}
            </p>
          </div>

          {/* USER */}
          <div>
            <p className="text-xs text-gray-400 uppercase">Customer</p>

            <p className="font-bold text-gray-900 mt-1">
              {review.user_name || "Customer"}
            </p>
          </div>

          {/* RATING */}
          <div>
            <p className="text-xs text-gray-400 uppercase mb-2">Rating</p>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={22}
                  className={
                    star <= Number(review.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div>
            <p className="text-xs text-gray-400 uppercase">Title</p>

            <p className="font-bold text-gray-900 mt-1">{review.title}</p>
          </div>

          {/* COMMENT */}
          <div>
            <p className="text-xs text-gray-400 uppercase">Comment</p>

            <p className="text-gray-600 leading-relaxed mt-2">
              {review.comment}
            </p>
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap gap-2">
            {review.is_verified_purchase && (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-semibold">
                <ShieldCheck size={16} />
                Verified Purchase
              </span>
            )}

            {review.is_approved ? (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-semibold">
                <CheckCircle size={16} />
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 text-sm font-semibold">
                <XCircle size={16} />
                Pending
              </span>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold"
          >
            Close
          </button>

          <button
            onClick={onDelete}
            className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 flex items-center gap-2"
          >
            <Trash2 size={17} />
            Delete Review
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="p-12 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />

      <p className="text-sm text-gray-500 mt-4">Loading reviews...</p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center">
        <MessageSquare size={28} className="text-gray-400" />
      </div>

      <h3 className="font-bold text-gray-900 mt-4">No reviews found</h3>

      <p className="text-sm text-gray-500 mt-1">
        Customer reviews will appear here.
      </p>
    </div>
  );
}
