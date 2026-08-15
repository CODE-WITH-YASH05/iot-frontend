import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingCart, FiStar, FiCheck } from "react-icons/fi";
import { useCart, useWishlist } from "../store/useStore";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100,
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col h-full glass-lg rounded-3xl overflow-hidden card-hover group"
      >
        {/* Image - Fixed Height */}
        <div className="relative h-64 flex-shrink-0 bg-gradient-to-br from-gray-800/20 to-gray-900/20 flex items-center justify-center p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {imgError ? (
            <div className="w-28 h-28 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-3xl font-black text-white">
                {product.name.charAt(0)}
              </span>
            </div>
          ) : (
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
              src={product.image}
              alt={product.name}
              className="w-44 h-44 object-contain relative z-10"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {product.badge && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500 text-black">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <div className="absolute top-3 right-3 z-20">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-xl border transition-all ${
                isInWishlist(product.id)
                  ? "bg-red-500/20 border-red-500/30 text-red-400"
                  : "bg-black/40 border-white/10 text-gray-400 opacity-0 group-hover:opacity-100"
              }`}
            >
              <FiHeart
                size={16}
                className={isInWishlist(product.id) ? "fill-red-400" : ""}
              />
            </motion.button>
          </div>
        </div>

        {/* Content - Flex grow to push button down */}
        <div className="flex flex-col flex-1 p-5">
          <p className="text-[11px] text-primary-light font-semibold uppercase tracking-wider mb-1">
            {product.brand || product.category}
          </p>
          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary-light transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(product.rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-600"
                  }
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-white">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          </div>

          {/* Spacer - Pushes button to bottom */}
          <div className="flex-1"></div>

          {/* Add to Cart - Always at bottom */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              added
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "btn-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? (
              <>
                <FiCheck size={14} /> Added!
              </>
            ) : (
              <>
                <FiShoppingCart size={14} /> Add to Cart
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}
