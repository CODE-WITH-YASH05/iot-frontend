import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageWithFallback from "../components/ImageWithFallback";
import { useCart } from "../store/useStore";
import { useProducts } from "../features/products/hooks/useProducts";
import { mapProduct } from "../features/products/utils/productMapper";

const sortOptions = [
  { value: "newest", label: "🔥 Newest First" },
  { value: "price_low", label: "💰 Price: Low to High" },
  { value: "price_high", label: "💰 Price: High to Low" },
  { value: "rating", label: "⭐ Top Rated" },
  { value: "popular", label: "📈 Most Popular" },
];

export default function Shop() {
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedItems, setAddedItems] = useState([]);

  // Fetch products from API
  const {
    products: apiProducts,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();

  // Map products with proper image URLs
  const products = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    return apiProducts.map(mapProduct).filter(Boolean);
  }, [apiProducts]);

  // Get unique categories from products with counts
  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const catName = product.category || "Uncategorized";
      const catSlug =
        product.categorySlug || catName.toLowerCase().replace(/\s+/g, "-");

      if (!categoryMap.has(catSlug)) {
        categoryMap.set(catSlug, {
          name: catName,
          slug: catSlug,
          count: 0,
          products: [],
        });
      }
      categoryMap.get(catSlug).count += 1;
      categoryMap.get(catSlug).products.push(product);
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query),
      );
    }

    // Category filter - only if categories are selected
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some(
          (cat) =>
            p.categorySlug === cat ||
            p.category?.toLowerCase().replace(/\s+/g, "-") === cat,
        ),
      );
    }

    // Price range filter
    if (priceRange.min) {
      result = result.filter((p) => p.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter((p) => p.price <= Number(priceRange.max));
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      default:
        // Newest - sort by created date
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, sortBy]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItems((prev) => [...prev, product.id]);
    setTimeout(
      () => setAddedItems((prev) => prev.filter((id) => id !== product.id)),
      1500,
    );
  };

  const handleCategoryToggle = (categorySlug) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categorySlug)) {
        return prev.filter((c) => c !== categorySlug);
      } else {
        return [...prev, categorySlug];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setSearchQuery("");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 animate-pulse">
              Loading amazing products...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <span className="material-symbols-outlined text-6xl text-red-400 mb-4">
              error_outline
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-500 mb-6">
              {error || "Failed to load products"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                refresh
              </span>
              Try Again
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-16 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3">
              IoT Devices Store
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Discover cutting-edge IoT products for your smart home and
              business
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-4">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-sm">
                  inventory_2
                </span>
                {products.length} Products
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-sm">
                  storefront
                </span>
                {products.filter((p) => p.inStock).length} In Stock
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-sm">
                  category
                </span>
                {categories.length} Categories
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="flex-grow py-8 md:py-12 px-4 md:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden bg-white rounded-2xl p-4 flex items-center justify-between text-sm font-semibold border border-gray-200 shadow-sm mb-4"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-indigo-600">
                tune
              </span>
              Filters & Categories
              {selectedCategories.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedCategories.length}
                </span>
              )}
            </span>
            <span
              className={`material-symbols-outlined transition-transform ${
                mobileFilterOpen ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Sidebar Filters */}
          <aside
            className={`lg:col-span-3 ${
              mobileFilterOpen ? "block" : "hidden"
            } lg:block`}
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:sticky lg:top-28 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600">
                    filter_list
                  </span>
                  Filters
                </h2>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    search
                  </span>
                  Search Products
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-outlined text-base">
                        close
                      </span>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-xs text-gray-400 mt-1">
                    Found {filteredProducts.length} results
                  </p>
                )}
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    category
                  </span>
                  Categories
                  <span className="ml-auto text-gray-400 text-[10px]">
                    {categories.length}
                  </span>
                </h3>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {categories.map((cat) => (
                    <label
                      key={cat.slug}
                      className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 rounded-lg px-3 py-2 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => handleCategoryToggle(cat.slug)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors flex-1">
                        {cat.name}
                      </span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {cat.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-3 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    payments
                  </span>
                  Price Range
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-center text-sm text-gray-900 focus:border-indigo-400 outline-none placeholder-gray-400"
                    />
                  </div>
                  <span className="text-gray-400 text-xs">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-center text-sm text-gray-900 focus:border-indigo-400 outline-none placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 ||
                searchQuery ||
                priceRange.min ||
                priceRange.max) && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategories.map((cat) => {
                      const category = categories.find((c) => c.slug === cat);
                      return (
                        category && (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100"
                          >
                            {category.name}
                            <button
                              onClick={() => handleCategoryToggle(cat)}
                              className="hover:bg-indigo-200 rounded-full w-4 h-4 flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-xs">
                                close
                              </span>
                            </button>
                          </span>
                        )
                      );
                    })}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                        "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery("")}
                          className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-xs">
                            close
                          </span>
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={clearAllFilters}
                className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  refresh
                </span>
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="lg:col-span-9">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  All Products
                  <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {filteredProducts.length}
                  </span>
                </h2>
                {selectedCategories.length > 0 && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Filtered by {selectedCategories.length} category
                    {selectedCategories.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-indigo-400 outline-none cursor-pointer font-medium hover:border-indigo-300 transition-all"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 flex-shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      viewMode === "grid"
                        ? "bg-indigo-100 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      grid_view
                    </span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      viewMode === "list"
                        ? "bg-indigo-100 text-indigo-600 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      view_list
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
                  : "flex flex-col gap-4"
              }
            >
              <AnimatePresence mode="wait">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      delay: Math.min(index * 0.03, 0.3),
                      duration: 0.4,
                    }}
                    className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative ${
                      viewMode === "list" ? "flex gap-4 items-center" : ""
                    }`}
                  >
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          product.inStock ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          product.inStock ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <Link
                      to={`/product/${product.slug || product.id}`}
                      className={`relative overflow-hidden bg-gray-50 flex items-center justify-center ${
                        viewMode === "grid"
                          ? "h-40 md:h-48 w-full"
                          : "w-32 md:w-40 h-32 md:h-40 flex-shrink-0"
                      }`}
                    >
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-500"
                        fallbackSrc="/placeholder-image.png"
                      />
                      {product.discountPrice &&
                        product.discountPrice < product.price && (
                          <span className="absolute bottom-2 left-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            {Math.round(
                              (1 - product.discountPrice / product.price) * 100,
                            )}
                            % OFF
                          </span>
                        )}
                    </Link>

                    <div
                      className={`p-4 md:p-5 flex flex-col ${
                        viewMode === "list" ? "flex-1 justify-center" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <Link to={`/product/${product.slug || product.id}`}>
                          <h3 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {product.name || "Unnamed Product"}
                          </h3>
                          {product.category && (
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                              {product.category}
                            </span>
                          )}
                        </Link>
                        <span className="text-xs md:text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg whitespace-nowrap">
                          ₹{product.price?.toLocaleString() || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="text-xs font-semibold text-gray-600">
                            {product.rating || 4.5}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          ({product.reviews || 0})
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-3 line-clamp-2 mt-1">
                        {product.description?.slice(0, 60) ||
                          "No description available"}
                      </p>

                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          {product.inStock ? (
                            <span className="text-[10px] text-green-600 font-medium">
                              ✓ {product.availableStock} available
                            </span>
                          ) : (
                            <span className="text-[10px] text-red-500 font-medium">
                              ✗ Out of stock
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          disabled={!product.inStock}
                          className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            !product.inStock
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : addedItems.includes(product.id)
                                ? "bg-green-50 border-green-300 text-green-600"
                                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md"
                          }`}
                        >
                          {!product.inStock
                            ? "Out of Stock"
                            : addedItems.includes(product.id)
                              ? "✓ Added"
                              : "+ Cart"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                  <span className="material-symbols-outlined text-4xl text-gray-400">
                    search_off
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any products matching your filters. Try
                  adjusting your search or filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    refresh
                  </span>
                  Clear All Filters
                </button>
              </motion.div>
            )}

            {/* Load More */}
            {filteredProducts.length > 0 && filteredProducts.length >= 12 && (
              <div className="flex justify-center mt-8">
                <button className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    expand_more
                  </span>
                  Load More Products
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
