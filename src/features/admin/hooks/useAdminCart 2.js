import { useCallback, useEffect, useMemo, useState } from "react";

import { adminCartApi } from "../api/Cart.api";

// ==========================================================
// ADMIN CART HOOK
// ==========================================================

export function useAdminCart({ autoFetch = true, params = {} } = {}) {
  // ========================================================
  // STATE
  // ========================================================

  const [carts, setCarts] = useState([]);

  const [selectedCart, setSelectedCart] = useState(null);

  const [loading, setLoading] = useState(autoFetch);

  const [detailLoading, setDetailLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);

  // ========================================================
  // ERROR MESSAGE
  // ========================================================

  const getErrorMessage = useCallback(
    (error, fallback = "Something went wrong.") => {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        fallback
      );
    },
    [],
  );

  // ========================================================
  // FETCH ALL CARTS
  // ========================================================

  const fetchCarts = useCallback(
    async (customParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await adminCartApi.getCarts({
          ...params,
          ...customParams,
        });

        const responseData = response?.data;

        const cartData = responseData?.data ?? responseData;

        const normalizedCarts = Array.isArray(cartData) ? cartData : [];

        setCarts(normalizedCarts);

        return normalizedCarts;
      } catch (error) {
        console.error("Admin fetch carts error:", error);

        const message = getErrorMessage(error, "Unable to load carts.");

        setError(message);

        throw error;
      } finally {
        setLoading(false);
      }
    },

    // IMPORTANT:
    // params ko dependency me mat rakho
    [],
  );

  // ========================================================
  // FETCH SINGLE CART
  // ========================================================

  const fetchCart = useCallback(
    async (cartId) => {
      try {
        if (!cartId) {
          throw new Error("Cart ID is required.");
        }

        setDetailLoading(true);
        setError(null);

        const response = await adminCartApi.getCart(cartId);

        const responseData = response?.data;

        const cartData = responseData?.data ?? responseData;

        setSelectedCart(cartData ?? null);

        return cartData;
      } catch (error) {
        console.error("Admin fetch cart error:", error);

        const message = getErrorMessage(error, "Unable to load cart.");

        setError(message);

        throw error;
      } finally {
        setDetailLoading(false);
      }
    },

    [getErrorMessage],
  );

  // ========================================================
  // DELETE CART
  // ========================================================

  const deleteCart = useCallback(
    async (cartId) => {
      try {
        if (!cartId) {
          throw new Error("Cart ID is required.");
        }

        setActionLoading(true);
        setError(null);

        const response = await adminCartApi.deleteCart(cartId);

        setCarts((previous) => previous.filter((cart) => cart.id !== cartId));

        setSelectedCart((previous) => {
          if (previous?.id === cartId) {
            return null;
          }

          return previous;
        });

        return response?.data;
      } catch (error) {
        console.error("Admin delete cart error:", error);

        const message = getErrorMessage(error, "Unable to delete cart.");

        setError(message);

        throw error;
      } finally {
        setActionLoading(false);
      }
    },

    [getErrorMessage],
  );

  // ========================================================
  // CLEAR CART
  // ========================================================

  const clearCart = useCallback(
    async (cartId) => {
      try {
        if (!cartId) {
          throw new Error("Cart ID is required.");
        }

        setActionLoading(true);
        setError(null);

        const response = await adminCartApi.clearCart(cartId);

        // Selected cart update
        setSelectedCart((previous) => {
          if (!previous || previous.id !== cartId) {
            return previous;
          }

          return {
            ...previous,

            items: [],

            item_count: 0,

            total_quantity: 0,

            subtotal: 0,
          };
        });

        // List update
        setCarts((previous) =>
          previous.map((cart) => {
            if (cart.id !== cartId) {
              return cart;
            }

            return {
              ...cart,

              items: [],

              item_count: 0,

              total_quantity: 0,

              subtotal: 0,
            };
          }),
        );

        return response?.data;
      } catch (error) {
        console.error("Admin clear cart error:", error);

        const message = getErrorMessage(error, "Unable to clear cart.");

        setError(message);

        throw error;
      } finally {
        setActionLoading(false);
      }
    },

    [getErrorMessage],
  );

  // ========================================================
  // REFRESH
  // ========================================================

  const refresh = useCallback(async () => {
    return fetchCarts();
  }, [fetchCarts]);

  // ========================================================
  // CLEAR ERROR
  // ========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================
  // STATISTICS
  // ========================================================

  const cartCount = useMemo(() => carts.length, [carts]);

  const totalItems = useMemo(() => {
    return carts.reduce(
      (total, cart) => total + Number(cart.total_quantity || 0),
      0,
    );
  }, [carts]);

  const totalValue = useMemo(() => {
    return carts.reduce((total, cart) => total + Number(cart.subtotal || 0), 0);
  }, [carts]);

  // ========================================================
  // INITIAL FETCH
  // ========================================================

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchCarts().catch(() => {
      // Error already handled
    });
  }, [autoFetch, fetchCarts]);

  // ========================================================
  // RETURN
  // ========================================================

  return {
    // Data
    carts,
    selectedCart,

    // Loading
    loading,
    detailLoading,
    actionLoading,

    // Error
    error,

    // Statistics
    cartCount,
    totalItems,
    totalValue,

    // Actions
    fetchCarts,
    fetchCart,
    deleteCart,
    clearCart,

    // Helpers
    refresh,
    clearError,
  };
}

export default useAdminCart;
