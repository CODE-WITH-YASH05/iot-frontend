<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { wishlistApi } from "../api/wishlist.api";

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist
=======
import { useCallback, useEffect, useState } from "react";

import { adminWishlistApi } from "../api/wishlist.api";

export function useAdminWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
<<<<<<< HEAD
      const response = await wishlistApi.getWishlist();
      const data = response?.data?.data || response?.data || [];
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setError(err?.response?.data?.message || "Failed to load wishlist");
=======

      const response = await adminWishlistApi.getWishlist();

      const responseData = response?.data;

      const data =
        responseData?.data ?? responseData?.results ?? responseData ?? [];

      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch admin wishlist:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to load wishlist.";

      setError(message);
      setWishlist([]);
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
    } finally {
      setIsLoading(false);
    }
  }, []);

<<<<<<< HEAD
  // Add to wishlist
  const addToWishlist = async (productId) => {
    try {
      setIsAdding(true);
      setError(null);
      await wishlistApi.addToWishlist(productId);
      await fetchWishlist();
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to add to wishlist";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsAdding(false);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      setIsAdding(true);
      setError(null);
      await wishlistApi.removeFromWishlist(productId);
      await fetchWishlist();
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to remove from wishlist";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsAdding(false);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some(
        (item) => item.product === productId || item.product?.id === productId,
      );
    },
    [wishlist],
  );

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

=======
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    isLoading,
<<<<<<< HEAD
    isAdding,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
=======
    error,
    fetchWishlist,
>>>>>>> 06aea52236f876a0fbdf68067e6cd707bc6354bd
  };
}
