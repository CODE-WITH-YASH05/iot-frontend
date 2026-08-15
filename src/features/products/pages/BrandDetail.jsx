import React, { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// Fix imports
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ImageWithFallback from "../../../components/ImageWithFallback";
import { useCart } from "../../../store/useStore";
import { useProducts } from "../hooks/useProducts";
import { mapProduct } from "../utils/productMapper";

export default function BrandDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { products: apiProducts, isLoading, isError, error } = useProducts();

  const products = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    return apiProducts.map(mapProduct).filter(Boolean);
  }, [apiProducts]);

  // Filter products by brand
  const brandProducts = useMemo(() => {
    let result = products.filter(
      (p) =>
        p.brandSlug === slug ||
        p.brand?.toLowerCase().replace(/\s+/g, "-") === slug,
    );

    if (searchQuery) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  }, [products, slug, searchQuery]);

  const brandName =
    products.find((p) => p.brandSlug === slug)?.brand ||
    slug?.replace(/-/g, " ") ||
    "Brand";

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItems((prev) => [...prev, product.id]);
    setTimeout(
      () => setAddedItems((prev) => prev.filter((id) => id !== product.id)),
      1500,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 animate-pulse">Loading brand...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
              Failed to load brand
            </h3>
            <p className="text-gray-500 mb-6">
              {error || "Something went wrong"}
            </p>
            <Link
              to="/brands"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Back to Brands
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      {/* Brand Hero */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-16 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <span className="text-4xl font-black text-white">
                {brandName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2">
              {brandName}
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              {brandProducts.length} products available
            </p>
          </motion.div>
          <div className="relative max-w-7xl mx-auto px-4 md:px-16 pb-4">
            <div className="text-sm text-white/70 flex items-center gap-2 justify-center">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/brands" className="hover:text-white transition-colors">
                Brands
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{brandName}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow py-8 md:py-12 px-4 md:px-16 max-w-7xl mx-auto w-full">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder={`Search ${brandName} products...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
        </div>

        {brandProducts.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
              storefront
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              No products available for this brand.
            </p>
            <Link
              to="/brands"
              className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Back to Brands
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {brandProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative"
              >
                <Link to={`/product/${product.slug}`}>
                  <div className="h-40 bg-gray-50 flex items-center justify-center p-4">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      fallbackSrc="/placeholder-image.png"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-indigo-600">
                      ₹{product.price?.toLocaleString() || 0}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        !product.inStock
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : addedItems.includes(product.id)
                            ? "bg-green-50 border-green-300 text-green-600"
                            : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
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
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
