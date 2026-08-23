import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { wishlistApi } from "../api/wishlist.api";

export function useWishlist() {
  const user = useSelector((state) => state.user?.user);

  const isAuthenticated = Boolean(user);

  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // FETCH WISHLIST
  // ============================================================

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await wishlistApi.getWishlist();

      const responseData = response?.data;

      const data =
        responseData?.data ?? responseData?.results ?? responseData ?? [];

      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to load wishlist.";

      setError(message);

      if (err?.response?.status === 401) {
        setWishlist([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // ============================================================
  // ADD
  // ============================================================

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      return {
        success: false,
        error: "Please login to add products to wishlist.",
      };
    }

    if (!productId) {
      return {
        success: false,
        error: "Product ID is missing.",
      };
    }

    try {
      setIsAdding(true);
      setError(null);

      await wishlistApi.addToWishlist(productId);

      await fetchWishlist();

      return {
        success: true,
      };
    } catch (err) {
      console.error("Failed to add wishlist:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to add product to wishlist.";

      setError(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setIsAdding(false);
    }
  };

  // ============================================================
  // REMOVE
  // ============================================================

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      return {
        success: false,
        error: "Please login first.",
      };
    }

    if (!productId) {
      return {
        success: false,
        error: "Product ID is missing.",
      };
    }

    try {
      setIsAdding(true);
      setError(null);

      await wishlistApi.removeFromWishlist(productId);

      setWishlist((current) =>
        current.filter((item) => {
          const itemProductId =
            typeof item?.product === "object"
              ? item?.product?.id
              : item?.product;

          return String(itemProductId) !== String(productId);
        }),
      );

      return {
        success: true,
      };
    } catch (err) {
      console.error("Failed to remove wishlist:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to remove product from wishlist.";

      setError(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setIsAdding(false);
    }
  };

  // ============================================================
  // CHECK
  // ============================================================

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) {
        return false;
      }

      return wishlist.some((item) => {
        const itemProductId =
          typeof item?.product === "object" ? item?.product?.id : item?.product;

        return String(itemProductId) === String(productId);
      });
    },
    [wishlist],
  );

  // ============================================================
  // TOGGLE
  // ============================================================

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      return {
        success: false,
        error: "Please login to use wishlist.",
      };
    }

    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    }

    return addToWishlist(productId);
  };

  // ============================================================
  // INITIAL FETCH
  // ============================================================

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    wishlist,
    isLoading,
    isAdding,
    error,

    isAuthenticated,

    fetchWishlist,
    addToWishlist,
    removeFromWishlist,

    isInWishlist,
    toggleWishlist,
  };
}
