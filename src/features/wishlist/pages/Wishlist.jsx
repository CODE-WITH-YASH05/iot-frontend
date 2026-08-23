import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ImageWithFallback from "../../../components/ImageWithFallback";

import { useWishlist } from "../../Wishlist/hooks/useWishlist";
import { useProduct } from "../../products/hooks/useProduct";
import { mapProduct } from "../../products/utils/productMapper";

function WishlistProductCard({ item, index, onRemove, isRemoving }) {
  const navigate = useNavigate();

  const productSlug = item?.product_slug || item?.product?.slug || "";

  /*
   * Fetch complete product details.
   *
   * Example:
   * GET /api/v1/products/yahs/
   */
  const { product: apiProduct, isLoading: isProductLoading } =
    useProduct(productSlug);

  /*
   * Convert API product into frontend product format.
   */
  const product = apiProduct ? mapProduct(apiProduct) : null;

  /*
   * Product ID
   */
  const productId = item?.product?.id || item?.product;

  /*
   * Product name
   */
  const productName = product?.name || item?.product_name || "Product";

  /*
   * Product image
   */
  const productImage =
    product?.image ||
    product?.imageUrls?.[0] ||
    product?.image_url ||
    product?.primaryImage ||
    "/placeholder-image.png";

  /*
   * Product price
   */
  const productPrice =
    product?.price ?? item?.product_discount_price ?? item?.product_price ?? 0;

  /*
   * Original price
   */
  const originalPrice = product?.originalPrice ?? item?.product_price ?? 0;

  /*
   * Open product detail page
   */
  const openProduct = () => {
    if (!productSlug) {
      return;
    }

    navigate(`/product/${productSlug}`);
  };

  /*
   * Loading product information
   */
  if (isProductLoading) {
    return (
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
          delay: index * 0.05,
        }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
      >
        <div className="aspect-square bg-gray-100 animate-pulse" />

        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-100 rounded animate-pulse" />
          <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.article
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
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* =========================================================
          PRODUCT IMAGE
      ========================================================== */}

      <div
        className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer"
        onClick={openProduct}
      >
        <ImageWithFallback
          src={productImage}
          alt={productName}
          className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500"
          fallbackSrc="/placeholder-image.png"
        />

        {/* Wishlist Badge */}
        <div className="absolute left-3 top-3 px-2.5 py-1 rounded-full bg-white/95 shadow-sm text-xs font-bold text-indigo-600">
          Wishlist
        </div>

        {/* Remove Wishlist */}
        <button
          type="button"
          disabled={isRemoving}
          onClick={(event) => {
            event.stopPropagation();

            onRemove(productId);
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          title="Remove from wishlist"
        >
          <span className="material-symbols-outlined text-xl">favorite</span>
        </button>
      </div>

      {/* =========================================================
          PRODUCT DETAILS
      ========================================================== */}

      <div className="p-4">
        {/* Product Name */}

        <Link to={`/products/${productSlug}`} className="block">
          <h2 className="font-bold text-gray-900 line-clamp-2 min-h-[48px] hover:text-indigo-600 transition-colors">
            {productName}
          </h2>
        </Link>

        {/* Price */}

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xl font-black text-gray-900">
            ₹{Number(productPrice).toLocaleString("en-IN")}
          </span>

          {Number(originalPrice) > Number(productPrice) && (
            <span className="text-sm text-gray-400 line-through">
              ₹{Number(originalPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* View Product */}

        <button
          type="button"
          onClick={openProduct}
          className="mt-4 w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-lg">visibility</span>
          View Product
        </button>
      </div>
    </motion.article>
  );
}

/*
|--------------------------------------------------------------------------
| Wishlist Page
|--------------------------------------------------------------------------
*/

export default function Wishlist() {
  const navigate = useNavigate();

  const {
    wishlist,
    isLoading,
    isAdding,
    error,
    isAuthenticated,
    removeFromWishlist,
  } = useWishlist();

  /*
   * ============================================================
   * NOT LOGGED IN
   * ============================================================
   */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4 pt-24">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-indigo-600">
                favorite
              </span>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-3">
              Your Wishlist
            </h1>

            <p className="text-gray-500 mb-7">
              Please login to view your wishlist.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/login", {
                  state: {
                    from: "/wishlist",
                  },
                })
              }
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <span className="material-symbols-outlined">login</span>
              Login
            </button>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-500">Loading your wishlist...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* =====================================================
              HEADER
          ====================================================== */}

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
            {/* Breadcrumb */}

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Link to="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>

              <span>/</span>

              <span className="text-gray-900">Wishlist</span>
            </div>

            {/* Title */}

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                  My Wishlist
                </h1>

                <p className="text-gray-500 mt-2">
                  {wishlist.length}{" "}
                  {wishlist.length === 1 ? "product" : "products"} saved
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Continue Shopping
              </Link>
            </div>
          </motion.div>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600">
              {error}
            </div>
          )}

          {/* =====================================================
              EMPTY
          ====================================================== */}

          {wishlist.length === 0 ? (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm py-16 px-6 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-indigo-500">
                  favorite
                </span>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-3">
                Your Wishlist is Empty
              </h2>

              <p className="text-gray-500 max-w-md mx-auto mb-7">
                You haven't added any products to your wishlist yet.
              </p>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Explore Products
              </Link>
            </motion.div>
          ) : (
            /* ===================================================
               PRODUCTS
            ==================================================== */

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {wishlist.map((item, index) => (
                <WishlistProductCard
                  key={item?.id || item?.product || index}
                  item={item}
                  index={index}
                  onRemove={removeFromWishlist}
                  isRemoving={isAdding}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
