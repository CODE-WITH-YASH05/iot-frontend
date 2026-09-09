<<<<<<< HEAD
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { useWishlist } from "../../wishlist/hooks/useWishlist";

export default function AdminWishlist() {
  const { wishlist, isLoading, error, removeFromWishlist } = useWishlist();

  return (
    <div className="min-h-screen">
      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Wishlist</h1>

          <p className="text-gray-500 mt-1">Products saved in wishlist</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
            <span className="text-sm text-gray-500">Total:</span>

            <span className="ml-2 font-bold text-indigo-600">
              {wishlist.length}
            </span>
          </div>

          <Link
            to="/admin/products"
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
=======
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminWishlist } from "../hooks/useWishlist";

export default function AdminWishlist() {
  const navigate = useNavigate();
  const { wishlist = [], isLoading, error, fetchWishlist } = useAdminWishlist();

  // =========================================================
  // PAGINATION & FILTER STATE
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("user_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table"); // table | grid

  // =========================================================
  // GROUP WISHLIST BY USER
  // =========================================================

  const users = useMemo(() => {
    const userMap = new Map();

    wishlist.forEach((item) => {
      const userId =
        item?.user_id || item?.user?.id || item?.user || "unknown-user";

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user_id: userId,
          user_name:
            item?.user_name ||
            item?.user?.name ||
            item?.user?.username ||
            "Unknown User",
          user_email:
            item?.user_email || item?.user?.email || "Email not available",
          user_avatar: item?.user?.avatar || null,
          products: [],
          total_items: 0,
          first_added: null,
          last_added: null,
        });
      }

      const userData = userMap.get(userId);
      userData.products.push(item);
      userData.total_items += 1;

      const addedDate = item?.created_at ? new Date(item.created_at) : null;
      if (addedDate) {
        if (!userData.first_added || addedDate < userData.first_added) {
          userData.first_added = addedDate;
        }
        if (!userData.last_added || addedDate > userData.last_added) {
          userData.last_added = addedDate;
        }
      }
    });

    return Array.from(userMap.values());
  }, [wishlist]);

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.user_name.toLowerCase().includes(term) ||
        user.user_email.toLowerCase().includes(term) ||
        user.products.some((p) =>
          (p?.product_name || p?.product?.name || "")
            .toLowerCase()
            .includes(term),
        ),
    );
  }, [users, searchTerm]);

  // =========================================================
  // SORT USERS
  // =========================================================

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];

    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "user_name":
          aVal = a.user_name.toLowerCase();
          bVal = b.user_name.toLowerCase();
          break;
        case "user_email":
          aVal = a.user_email.toLowerCase();
          bVal = b.user_email.toLowerCase();
          break;
        case "total_items":
          aVal = a.total_items;
          bVal = b.total_items;
          break;
        case "last_added":
          aVal = a.last_added ? a.last_added.getTime() : 0;
          bVal = b.last_added ? b.last_added.getTime() : 0;
          break;
        default:
          aVal = a.user_name.toLowerCase();
          bVal = b.user_name.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredUsers, sortBy, sortOrder]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  // =========================================================
  // STATS
  // =========================================================

  const totalUsers = users.length;
  const totalWishlistItems = wishlist.length;
  const avgItemsPerUser =
    totalUsers > 0 ? (totalWishlistItems / totalUsers).toFixed(1) : 0;

  // =========================================================
  // HANDLE SORT
  // =========================================================

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // =========================================================
  // GET SORT ICON
  // =========================================================

  const getSortIcon = (field) => {
    if (sortBy !== field) return "unfold_more";
    return sortOrder === "asc" ? "expand_less" : "expand_more";
  };

  // =========================================================
  // IMAGE HELPER
  // =========================================================

  const getImage = (item) => {
    return (
      item?.product_image ||
      item?.product?.image ||
      item?.product_primary_image ||
      null
    );
  };

  // =========================================================
  // PRODUCT URL
  // =========================================================

  const getProductUrl = (item) => {
    const slug = item?.product_slug || item?.product?.slug;
    return slug ? `/product/${slug}` : "/admin/products";
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    const value = Number(price || 0);
    return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: "people",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      title: "Wishlist Items",
      value: totalWishlistItems,
      icon: "favorite",
      color: "from-red-500 to-red-600",
      bg: "bg-red-50",
      text: "text-red-600",
    },
    {
      title: "Avg Items/User",
      value: avgItemsPerUser,
      icon: "analytics",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.total_items > 0).length,
      icon: "trending_up",
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      text: "text-green-600",
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-red-500">
              favorite
            </span>
            Wishlist Management
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage products saved by customers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchWishlist}
            disabled={isLoading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              {isLoading ? "progress_activity" : "refresh"}
            </span>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/admin/products"
            className="px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              inventory_2
            </span>
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
            Manage Products
          </Link>
        </div>
      </div>

<<<<<<< HEAD
      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

            <p className="mt-4 text-gray-500">Loading wishlist...</p>
          </div>
        </div>
      ) : wishlist.length === 0 ? (
        /* =========================
            EMPTY
        ========================= */

        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              favorite_border
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-5">
            No Wishlist Products
          </h2>

          <p className="text-gray-500 mt-2">
            There are no products saved in the wishlist.
          </p>

          <Link
            to="/admin/products"
            className="inline-flex mt-6 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            View Products
          </Link>
        </div>
      ) : (
        /* =========================
            PRODUCTS
        ========================= */

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item, index) => {
            const product = item.product;

            /*
             * Backend WishlistSerializer currently
             * returns product as an ID.
             *
             * Product name/slug/price are also
             * returned separately.
             */

            const productId =
              typeof product === "object" ? product?.id : product;

            const productName = item.product_name || "Product";

            const productSlug = item.product_slug;

            const productPrice = Number(item.product_price || 0);

            const discountPrice = Number(item.product_discount_price || 0);

            return (
              <motion.div
                key={item.id || index}
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
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                {/* Product Image */}

                <Link
                  to={
                    productSlug ? `/product/${productSlug}` : "/admin/products"
                  }
                  className="block"
                >
                  <div className="h-56 bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-300">
                        inventory_2
                      </span>

                      <p className="text-xs text-gray-400 mt-2">
                        Product Image
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 line-clamp-2">
                        {productName}
                      </h3>

                      {productSlug && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {productSlug}
                        </p>
                      )}
                    </div>

                    <span className="material-symbols-outlined text-red-500">
                      favorite
                    </span>
                  </div>

                  {/* Price */}

                  <div className="mt-4">
                    {discountPrice > 0 && discountPrice < productPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-gray-900">
                          ₹{discountPrice.toLocaleString()}
                        </span>

                        <span className="text-sm text-gray-400 line-through">
                          ₹{productPrice.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-black text-gray-900">
                        ₹{productPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}

                  <div className="flex gap-2 mt-5">
                    <Link
                      to={
                        productSlug
                          ? `/product/${productSlug}`
                          : "/admin/products"
                      }
                      className="flex-1 text-center px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                      View Product
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(productId)}
                      className="w-11 h-11 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center justify-center"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
=======
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bg} rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  {stat.icon}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search by user or product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Items Per Page */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-indigo-400 outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg text-sm transition-all ${
                viewMode === "table"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-lg">
                view_list
              </span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-sm transition-all ${
                viewMode === "grid"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-lg">
                grid_view
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
          {totalItems} users
        </p>
        {searchTerm && (
          <p className="text-sm text-gray-400">
            Filtered results: {filteredUsers.length} users
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl bg-red-50 border border-red-200"
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">
              error
            </span>
            <div>
              <div className="font-semibold text-red-700">
                Failed to load wishlist
              </div>
              <div className="text-sm text-red-600 mt-1">{error}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-5 text-gray-500 font-medium">
              Loading customer wishlists...
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Fetching all wishlist data
            </p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm"
        >
          <div className="relative inline-block">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-red-400">
                favorite_border
              </span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {wishlist.length}
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mt-6">
            {searchTerm ? "No Matching Results" : "No Wishlist Data"}
          </h2>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            {searchTerm
              ? `No users or products found matching "${searchTerm}"`
              : "No customer has added any product to their wishlist yet."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              Clear Search
            </button>
          )}
        </motion.div>
      ) : viewMode === "table" ? (
        /* =====================================================
           TABLE VIEW - Best for 10000+ users
        ===================================================== */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                    onClick={() => handleSort("user_name")}
                  >
                    <div className="flex items-center gap-1">
                      User
                      <span className="material-symbols-outlined text-sm">
                        {getSortIcon("user_name")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors hidden md:table-cell"
                    onClick={() => handleSort("user_email")}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      <span className="material-symbols-outlined text-sm">
                        {getSortIcon("user_email")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                    onClick={() => handleSort("total_items")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Items
                      <span className="material-symbols-outlined text-sm">
                        {getSortIcon("total_items")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors hidden lg:table-cell"
                    onClick={() => handleSort("last_added")}
                  >
                    <div className="flex items-center gap-1">
                      Last Added
                      <span className="material-symbols-outlined text-sm">
                        {getSortIcon("last_added")}
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {currentUsers.map((user, index) => (
                    <motion.tr
                      key={user.user_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(user.user_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.user_name}
                            </p>
                            <p className="text-xs text-gray-400 truncate md:hidden">
                              {user.user_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px] hidden md:table-cell">
                        {user.user_email}
                      </td>

                      {/* Items Count */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                          {user.total_items}
                        </span>
                      </td>

                      {/* Last Added */}
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {formatDate(user.last_added)}
                      </td>

                      {/* Products Preview */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex -space-x-2">
                            {user.products.slice(0, 3).map((item, idx) => {
                              const image = getImage(item);
                              return (
                                <div
                                  key={idx}
                                  className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden flex-shrink-0"
                                >
                                  {image ? (
                                    <img
                                      src={image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                      📦
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {user.products.length > 3 && (
                            <span className="text-xs text-gray-400 font-medium ml-1">
                              +{user.products.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {endIndex} of {totalItems} users
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =====================================================
           GRID VIEW - For smaller screens or visual browsing
        ===================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {currentUsers.map((user, userIndex) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: userIndex * 0.03 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(user.user_name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.user_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.user_email}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                      {user.total_items}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {user.products.slice(0, 6).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigate(getProductUrl(item))}
                        className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden hover:border-indigo-300 transition-all group"
                      >
                        {getImage(item) ? (
                          <img
                            src={getImage(item)}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            📦
                          </div>
                        )}
                      </button>
                    ))}
                    {user.products.length > 6 && (
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                        +{user.products.length - 6}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Last added: {formatDate(user.last_added)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination for Grid View */}
      {viewMode === "grid" && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            Next
          </button>
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
        </div>
      )}
    </div>
  );
}
