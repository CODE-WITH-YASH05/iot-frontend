import React from "react";
import { Link } from "react-router-dom";
import { useWishlist, useCart } from "../store/useStore";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🤍</span>
          <h2 className="text-2xl text-white mt-4">Your wishlist is empty</h2>
          <Link to="/shop" className="text-primary mt-2 inline-block">
            Browse Products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          My Wishlist ({wishlist.length})
        </h1>
        <div className="space-y-4">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="glass rounded-2xl p-4 flex items-center space-x-4"
            >
              <Link to={`/product/${product.id}`}>
                <span className="text-4xl">{product.image}</span>
              </Link>
              <div className="flex-1">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-white font-medium">{product.name}</h3>
                </Link>
                <p className="text-primary font-bold">
                  ₹{product.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => addToCart(product)}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-lg"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="text-red-400 hover:text-red-300 text-xl"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
