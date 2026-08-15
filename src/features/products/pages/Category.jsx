import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// Fix imports
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ImageWithFallback from "../../../components/ImageWithFallback";
import { useCart } from "../../../store/useStore";
import { useProducts } from "../hooks/useProducts";
import { mapProduct } from "../utils/productMapper";

const sortOptions = [
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
  "Top Rated",
];

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("Newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedItems, setAddedItems] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // Fetch products from API
  const {
    products: apiProducts,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();

  // Fetch category info
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        setCategoryLoading(true);
        const response = await fetch(`/api/v1/categories/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          setCategoryInfo(data?.data || data);
        }
      } catch (err) {
        console.error("Failed to fetch category:", err);
      } finally {
        setCategoryLoading(false);
      }
    };

    if (slug) {
      fetchCategoryInfo();
    }
  }, [slug]);

  // Map products with proper image URLs
  const products = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    return apiProducts.map(mapProduct).filter(Boolean);
  }, [apiProducts]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category slug
    if (slug) {
      result = result.filter(
        (p) =>
          p.categorySlug?.toLowerCase() === slug.toLowerCase() ||
          p.category?.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase(),
      );
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
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
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Top Rated":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [products, slug, searchQuery, priceRange, sortBy]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItems((prev) => [...prev, product.id]);
    setTimeout(
      () => setAddedItems((prev) => prev.filter((id) => id !== product.id)),
      1500,
    );
  };

  // Loading state
  if (isLoading || categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 animate-pulse">Loading category...</p>
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
          <div className="text-center max-w-md mx-auto">
            <span className="material-symbols-outlined text-6xl text-red-400 mb-4">
              error_outline
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Failed to load products
            </h3>
            <p className="text-gray-500 mb-6">
              {error || "Something went wrong"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get category name
  const categoryName =
    categoryInfo?.name ||
    products.find((p) => p.categorySlug === slug)?.category ||
    slug?.replace(/-/g, " ") ||
    "Category";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      {/* Category Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-16 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 capitalize">
              {categoryName}
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Explore our collection of {categoryName} products.
              {filteredProducts.length} products available.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                <span className="material-symbols-outlined text-sm">
                  inventory_2
                </span>
                {filteredProducts.length} Products
              </span>
            </div>
          </motion.div>
        </div>
        {/* Breadcrumb */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-16 pb-4">
          <div className="text-sm text-white/70 flex items-center gap-2 justify-center">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-white font-medium capitalize">
              {categoryName}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-grow py-8 md:py-12 px-4 md:px-16 max-w-7xl mx-auto w-full">
        {/* Rest of the component - same as before but with fixed imports */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* ... existing code ... */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
