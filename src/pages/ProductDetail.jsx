import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageWithFallback from "../components/ImageWithFallback";
import Reviews from "../features/Reviews/components/Reviews";
import { useCart } from "../features/cart/hooks/useCart";
import { tokenManager } from "../api/token-manager";
import { useProduct } from "../features/products/hooks/useProduct";
import { useWishlist } from "../features/Wishlist/hooks/useWishlist";
import { mapProduct } from "../features/products/utils/productMapper";

// ==========================================================
// FULL SCREEN IMAGE VIEWER
// ==========================================================

const FullScreenImageViewer = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setTouchEndX(e.changedTouches[0].clientX);
    if (touchStartX - touchEndX > 50) {
      onNext();
    } else if (touchStartX - touchEndX < -50) {
      onPrev();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
      >
        <span className="material-symbols-outlined text-3xl">close</span>
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Image */}
      <div
        className="relative w-full h-full flex items-center justify-center px-4 cursor-zoom-in"
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(!isZoomed);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.img
          src={images[currentIndex] || images[0]}
          alt={`Product ${currentIndex + 1}`}
          className={`max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-300 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            e.target.src = "/placeholder-image.png";
          }}
        />
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <span className="material-symbols-outlined text-4xl">
              chevron_left
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <span className="material-symbols-outlined text-4xl">
              chevron_right
            </span>
          </button>
        </>
      )}

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs">
        {isZoomed ? "🔍 Click to zoom out" : "🔍 Click to zoom in"}
      </div>
    </motion.div>
  );
};

// ==========================================================
// PRODUCT DETAIL COMPONENT
// ==========================================================

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, actionLoading } = useCart();
  const { toggleWishlist, isInWishlist, isAdding } = useWishlist();

  const [selectedImg, setSelectedImg] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);
  const mainImageRef = useRef(null);

  // Fetch product from API
  const {
    product: apiProduct,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(slug);

  // Map product data
  const product = apiProduct ? mapProduct(apiProduct) : null;

  // Get images - ensure we have a valid array
  const images = product?.imageUrls || [];
  const primaryImage = product?.image || "/placeholder-image.png";
  const displayImages = images.length > 0 ? images : [primaryImage];

  // Check if product is in wishlist
  const inWishlist = product ? isInWishlist(product.id) : false;

  // Reset selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImg(0);
    }
  }, [product]);

  // Handle image click
  const handleImageClick = (index) => {
    if (index >= 0 && index < displayImages.length) {
      setSelectedImg(index);
    }
  };

  // Handle full screen image view
  const openFullScreen = (index) => {
    setFullScreenIndex(index);
    setShowFullScreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    if (showFullScreen) {
      setFullScreenIndex((prev) => (prev + 1) % displayImages.length);
    } else {
      setSelectedImg((prev) => (prev + 1) % displayImages.length);
    }
  };

  const prevImage = () => {
    if (showFullScreen) {
      setFullScreenIndex(
        (prev) => (prev - 1 + displayImages.length) % displayImages.length,
      );
    } else {
      setSelectedImg(
        (prev) => (prev - 1 + displayImages.length) % displayImages.length,
      );
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (touchStartX - touchEndX > 50) {
      nextImage();
    } else if (touchStartX - touchEndX < -50) {
      prevImage();
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "Escape" && showFullScreen) {
        closeFullScreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayImages.length, showFullScreen]);

  const handleAddToCart = async () => {
    if (!product) return;

    const accessToken = tokenManager.getAccessToken();

    if (!accessToken) {
      navigate("/login", {
        state: {
          from: `/product/${product.slug}`,
          action: "add_to_cart",
          productId: product.id,
          quantity,
        },
      });
      return;
    }

    try {
      await addItem(product.id, quantity);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 1500);
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    const accessToken = tokenManager.getAccessToken();

    if (!accessToken) {
      navigate("/login", {
        state: {
          from: `/product/${product.slug}`,
          action: "wishlist",
          productId: product.id,
        },
      });
      return;
    }

    try {
      const result = await toggleWishlist(product.id);
      if (!result?.success) {
        console.error("Wishlist failed:", result?.error);
        return;
      }
      console.log("Wishlist updated successfully");
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
    }
  };

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const discount = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 animate-pulse">
              Loading amazing product...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (isError || !product) {
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
              Oops! Product not found
            </h3>
            <p className="text-gray-500 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Shop
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />

      {/* Floating Decorative Elements */}
      <div className="fixed top-40 left-10 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-40 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Full Screen Image Viewer */}
      <AnimatePresence>
        {showFullScreen && (
          <FullScreenImageViewer
            images={displayImages}
            currentIndex={fullScreenIndex}
            onClose={closeFullScreen}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}
      </AnimatePresence>

      <main className="pt-20 md:pt-24 relative">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 py-8 md:py-12">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs sm:text-sm text-gray-500 mb-6 md:mb-8 flex items-center gap-1 sm:gap-2 flex-wrap"
          >
            <Link
              to="/"
              className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">
                home
              </span>
              <span className="hidden sm:inline">Home</span>
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              to="/shop"
              className="hover:text-indigo-600 transition-colors"
            >
              Shop
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium line-clamp-1 max-w-[150px] sm:max-w-xs">
              {product.name}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {/* Left: Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 md:space-y-4"
            >
              {/* Main Image */}
              <div
                ref={mainImageRef}
                className="relative bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-lg md:shadow-xl group cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => openFullScreen(selectedImg)}
              >
                <div className="aspect-square flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImg}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <ImageWithFallback
                        src={displayImages[selectedImg] || primaryImage}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        fallbackSrc="/placeholder-image.png"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Full Screen Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">
                        fullscreen
                      </span>
                      Click to enlarge
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows - Desktop */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 hidden sm:flex"
                    >
                      <span className="material-symbols-outlined text-gray-700">
                        chevron_left
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 hidden sm:flex"
                    >
                      <span className="material-symbols-outlined text-gray-700">
                        chevron_right
                      </span>
                    </button>
                  </>
                )}

                {/* Image Counter - Mobile */}
                {displayImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full sm:hidden">
                    {selectedImg + 1} / {displayImages.length}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 md:gap-2">
                  {discount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg shadow-indigo-500/30"
                    >
                      🔥 {discount}% OFF
                    </motion.span>
                  )}
                  {product.featured && (
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg shadow-yellow-500/30">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-xl md:text-2xl font-bold px-4 py-2 md:px-6 md:py-3 bg-red-500/90 rounded-2xl">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {displayImages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                    {displayImages.map((img, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleImageClick(index)}
                        className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all snap-start ${
                          selectedImg === index
                            ? "border-indigo-500 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-200"
                            : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                        }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          fallbackSrc="/placeholder-image.png"
                        />
                        {selectedImg === index && (
                          <div className="absolute inset-0 bg-indigo-500/10" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {/* Scroll Indicator */}
                  {displayImages.length > 3 && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
                  )}
                </motion.div>
              )}

              {/* Swipe Indicator - Mobile */}
              {displayImages.length > 1 && (
                <p className="text-[10px] text-gray-400 text-center sm:hidden">
                  👆 Swipe left/right to browse images
                </p>
              )}
            </motion.div>

            {/* Right: Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Category & Brand */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="text-[10px] md:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-indigo-100">
                    {product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="text-[10px] md:text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-purple-100">
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-base md:text-xl">
                      {i < Math.floor(product.rating || 0) ? "⭐" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-xs md:text-sm text-gray-500">
                  ({product.reviews || 0} reviews)
                </span>
                <span className="hidden sm:block w-px h-4 bg-gray-300"></span>
                <span className="text-xs md:text-sm text-green-600 font-medium">
                  ★ 4.8/5
                </span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-indigo-100">
                <div className="flex items-baseline gap-2 md:gap-4 flex-wrap">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                    ₹{product.price?.toLocaleString() || 0}
                  </span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-base md:text-xl text-gray-400 line-through">
                        ₹{product.originalPrice?.toLocaleString() || 0}
                      </span>
                      <span className="text-[10px] md:text-sm font-bold text-white bg-green-500 px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
                {product.originalPrice > product.price && (
                  <p className="text-xs md:text-sm text-green-600 mt-1">
                    🎉 You're saving ₹
                    {(product.originalPrice - product.price).toLocaleString()}!
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {product.fullDescription || product.description}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 p-3 md:p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse ${
                      product.inStock ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span
                    className={`text-xs md:text-sm font-bold ${
                      product.inStock ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.inStock
                      ? `✅ In Stock (${product.availableStock} available)`
                      : "❌ Out of Stock"}
                  </span>
                </div>
                {product.sku && (
                  <>
                    <span className="hidden sm:block w-px h-6 bg-gray-200"></span>
                    <span className="text-xs md:text-sm text-gray-400">
                      SKU: {product.sku}
                    </span>
                  </>
                )}
              </div>

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="flex flex-wrap items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-xl border border-gray-100">
                  <span className="text-xs md:text-sm font-semibold text-gray-700">
                    Quantity:
                  </span>
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-xl font-bold text-lg md:text-xl transition-colors"
                    >
                      −
                    </button>
                    <span className="w-10 md:w-14 text-center font-bold text-gray-900 text-base md:text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.availableStock || 99, quantity + 1),
                        )
                      }
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-xl font-bold text-lg md:text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-400">
                    Max {product.availableStock}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!product.inStock || actionLoading}
                  className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
                    !product.inStock
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : added
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40"
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base md:text-xl">
                        {added
                          ? "check_circle"
                          : !product.inStock
                            ? "block"
                            : "shopping_cart"}
                      </span>

                      {!product.inStock
                        ? "Out of Stock"
                        : added
                          ? "Added! ✓"
                          : "Add to Cart"}
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
                    !product.inStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-lg"
                  }`}
                >
                  <span className="material-symbols-outlined text-base md:text-xl">
                    flash_on
                  </span>
                  Buy Now
                </motion.button>
              </div>

              {/* Quick Action Icons */}
              <div className="flex items-center justify-center gap-4 md:gap-6 py-2 md:py-3">
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={isAdding}
                  className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm transition-colors group ${
                    inWishlist
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <span className="material-symbols-outlined text-base md:text-xl group-hover:scale-110 transition-transform">
                    {isAdding
                      ? "progress_activity"
                      : inWishlist
                        ? "favorite"
                        : "favorite_border"}
                  </span>

                  <span className="hidden xs:inline">
                    {inWishlist ? "Remove from Wishlist" : "Wishlist"}
                  </span>
                </button>
                <button className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500 hover:text-indigo-600 transition-colors group">
                  <span className="material-symbols-outlined text-base md:text-xl group-hover:scale-110 transition-transform">
                    compare_arrows
                  </span>
                  <span className="hidden xs:inline">Compare</span>
                </button>
                <button className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500 hover:text-indigo-600 transition-colors group">
                  <span className="material-symbols-outlined text-base md:text-xl group-hover:scale-110 transition-transform">
                    share
                  </span>
                  <span className="hidden xs:inline">Share</span>
                </button>
              </div>

              {/* Specifications Accordion */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleAccordion("specifications")}
                    className="w-full flex justify-between items-center px-4 py-3 md:px-6 md:py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs md:text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600 text-base md:text-xl">
                        list_alt
                      </span>
                      Full Specifications
                    </span>
                    <motion.span
                      animate={{
                        rotate: openAccordion === "specifications" ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="material-symbols-outlined text-gray-400 text-base md:text-xl"
                    >
                      expand_more
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "specifications" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 md:px-6 md:pb-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            {Object.entries(product.specs).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between items-center text-xs md:text-sm py-2 md:py-3 px-3 md:px-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-100"
                                >
                                  <span className="text-gray-500 font-medium">
                                    {key}
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {value}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-200">
                {[
                  {
                    icon: "verified",
                    label: "Authentic",
                    desc: "100% Genuine",
                  },
                  { icon: "security", label: "Secure", desc: "Safe Payment" },
                  {
                    icon: "support_agent",
                    label: "Support",
                    desc: "24/7 Help",
                  },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <span className="material-symbols-outlined text-xl md:text-2xl text-indigo-600">
                      {item.icon}
                    </span>
                    <p className="text-[10px] md:text-xs font-bold text-gray-700 mt-0.5 md:mt-1">
                      {item.label}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <Reviews productSlug={slug} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
