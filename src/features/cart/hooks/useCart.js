import { useCallback, useEffect, useMemo, useState } from "react";

import { cartApi } from "../api/cartApi";

export function useCart() {
  // ==========================================
  // STATE
  // ==========================================

  const [cart, setCart] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);

  // ==========================================
  // FETCH CART
  // ==========================================

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await cartApi.getCart();

      const responseData = response?.data;

      /*
       * Backend success_response:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {...}
       * }
       */

      const cartData = responseData?.data ?? responseData;
      console.log("CART DATA:", JSON.stringify(cartData, null, 2));

      setCart(cartData ?? null);

      return cartData;
    } catch (err) {
      console.error("Fetch cart error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Unable to load cart.",
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // ADD ITEM
  // ==========================================

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      try {
        setActionLoading(true);
        setError(null);

        const response = await cartApi.addItem(productId, quantity);

        await fetchCart();

        return response?.data;
      } catch (err) {
        console.error("Add cart item error:", err);

        setError(
          err?.response?.data?.quantity?.[0] ||
            err?.response?.data?.product?.[0] ||
            err?.response?.data?.message ||
            err?.response?.data?.detail ||
            "Unable to add product to cart.",
        );

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchCart],
  );

  // ==========================================
  // UPDATE ITEM
  // ==========================================

  const updateItem = useCallback(
    async (itemId, quantity) => {
      try {
        setActionLoading(true);
        setError(null);

        const response = await cartApi.updateItem(itemId, quantity);

        await fetchCart();

        return response?.data;
      } catch (err) {
        console.error("Update cart item error:", err);

        setError(
          err?.response?.data?.quantity?.[0] ||
            err?.response?.data?.message ||
            err?.response?.data?.detail ||
            "Unable to update cart item.",
        );

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchCart],
  );

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = useCallback(
    async (itemId) => {
      try {
        setActionLoading(true);
        setError(null);

        const response = await cartApi.removeItem(itemId);

        await fetchCart();

        return response?.data;
      } catch (err) {
        console.error("Remove cart item error:", err);

        setError(
          err?.response?.data?.item?.[0] ||
            err?.response?.data?.message ||
            err?.response?.data?.detail ||
            "Unable to remove cart item.",
        );

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchCart],
  );

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clear = useCallback(async () => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await cartApi.clearCart();

      await fetchCart();

      return response?.data;
    } catch (err) {
      console.error("Clear cart error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Unable to clear cart.",
      );

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [fetchCart]);

  // ==========================================
  // DERIVED VALUES
  // ==========================================

  const items = useMemo(() => {
    return cart?.items ?? [];
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart?.item_count ?? 0;
  }, [cart]);

  const totalQuantity = useMemo(() => {
    return cart?.total_quantity ?? 0;
  }, [cart]);

  const cartTotal = useMemo(() => {
    const subtotal = cart?.subtotal;

    if (subtotal === null || subtotal === undefined) {
      return 0;
    }

    return Number(subtotal);
  }, [cart]);

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    cart,
    items,

    loading,
    actionLoading,
    error,

    cartCount,
    totalQuantity,
    cartTotal,

    fetchCart,

    addItem,
    updateItem,
    removeItem,
    clear,
  };
}

export default useCart;
