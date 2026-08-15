import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// Fix imports - Go up 4 levels to src/
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ImageWithFallback from "../../../components/ImageWithFallback";
import { useProducts } from "../hooks/useProducts";
import { mapProduct } from "../utils/productMapper";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { products: apiProducts, isLoading: productsLoading } = useProducts();

  // Extract brands from products
  useEffect(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return;

    const products = apiProducts.map(mapProduct).filter(Boolean);
    const brandMap = new Map();

    products.forEach((product) => {
      if (product.brand) {
        if (!brandMap.has(product.brandSlug)) {
          brandMap.set(product.brandSlug, {
            name: product.brand,
            slug: product.brandSlug,
            count: 0,
            products: [],
            image: product.image,
          });
        }
        brandMap.get(product.brandSlug).count += 1;
        brandMap.get(product.brandSlug).products.push(product);
      }
    });

    setBrands(Array.from(brandMap.values()).sort((a, b) => b.count - a.count));
    setIsLoading(false);
  }, [apiProducts]);

  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 animate-pulse">Loading brands...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-16 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3">
              Our Brands
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
              Discover products from the world's leading IoT brands
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="material-symbols-outlined text-sm">
                  storefront
                </span>
                {brands.length} Brands
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="flex-grow py-8 md:py-12 px-4 md:px-16 max-w-7xl mx-auto w-full">
        {brands.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
              storefront
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No brands found
            </h3>
            <p className="text-gray-500">
              No brands are available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/brand/${brand.slug}`}
                  className="block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group"
                >
                  <div className="aspect-video bg-gray-50 flex items-center justify-center p-6">
                    {brand.image ? (
                      <ImageWithFallback
                        src={brand.image}
                        alt={brand.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        fallbackSrc="/placeholder-image.png"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-indigo-600">
                          {brand.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {brand.count} product{brand.count > 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
