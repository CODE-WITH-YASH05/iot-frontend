import { useCallback, useEffect, useState } from "react";

import { adminWishlistApi } from "../api/wishlist.api";

export function useAdminWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    isLoading,
    error,
    fetchWishlist,
  };
}
