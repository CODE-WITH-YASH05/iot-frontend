import { useCallback, useEffect, useRef, useState } from "react";

import adminOrderApi from "../api/orders.api";

// ==========================================================
// ADMIN ORDERS HOOK
// ==========================================================

export function useAdminOrders({ autoFetch = true, initialParams = {} } = {}) {
  // ========================================================
  // STATE
  // ========================================================

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);

  // ========================================================
  // STORE INITIAL PARAMS
  // ========================================================

  const initialParamsRef = useRef(initialParams);

  // ========================================================
  // FETCH ALL ORDERS
  // ========================================================

  const fetchOrders = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const mergedParams = {
        ...initialParamsRef.current,
        ...params,
      };

      console.log("ADMIN ORDERS FETCH:", mergedParams);

      const response = await adminOrderApi.getOrders(mergedParams);

      console.log("ADMIN ORDERS RESPONSE:", response);

      const responseData = response?.data;

      const orderData =
        responseData?.data ?? responseData?.results ?? responseData;

      console.log("ADMIN ORDERS DATA:", JSON.stringify(orderData, null, 2));

      setOrders(Array.isArray(orderData) ? orderData : []);

      return orderData;
    } catch (err) {
      console.error("ADMIN ORDERS FETCH ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load orders.";

      setError(message);
      setOrders([]);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================
  // FETCH SINGLE ORDER
  // ========================================================

  const fetchOrder = useCallback(async (orderId) => {
    if (!orderId) {
      return null;
    }

    try {
      setDetailLoading(true);
      setError(null);

      const response = await adminOrderApi.getOrder(orderId);

      const responseData = response?.data;

      const orderData = responseData?.data ?? responseData;

      console.log("ADMIN ORDER DETAIL:", JSON.stringify(orderData, null, 2));

      setSelectedOrder(orderData ?? null);

      return orderData;
    } catch (err) {
      console.error("ADMIN ORDER DETAIL ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load order details.";

      setError(message);
      setSelectedOrder(null);

      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ========================================================
  // FETCH HISTORY
  // ========================================================

  const fetchHistory = useCallback(async (orderId) => {
    if (!orderId) {
      return [];
    }

    try {
      setHistoryLoading(true);
      setError(null);

      const response = await adminOrderApi.getHistory(orderId);

      const responseData = response?.data;

      const historyData = responseData?.data ?? responseData;

      console.log("ADMIN ORDER HISTORY:", JSON.stringify(historyData, null, 2));

      const history = Array.isArray(historyData) ? historyData : [];

      setOrderHistory(history);

      return history;
    } catch (err) {
      console.error("ADMIN ORDER HISTORY ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load order history.";

      setError(message);
      setOrderHistory([]);

      throw err;
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ========================================================
  // UPDATE STATUS
  // ========================================================

  const updateStatus = useCallback(
    async (orderId, status) => {
      if (!orderId || !status) {
        throw new Error("Order ID and status are required.");
      }

      try {
        setActionLoading(true);
        setError(null);

        console.log("UPDATING ORDER STATUS:", {
          orderId,
          status,
        });

        const response = await adminOrderApi.updateStatus(orderId, status);

        const responseData = response?.data;

        const updatedOrder = responseData?.data ?? responseData;

        console.log(
          "UPDATED ADMIN ORDER:",
          JSON.stringify(updatedOrder, null, 2),
        );

        // Update selected order
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }

        // Update list
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  ...(updatedOrder || {}),
                  status: updatedOrder?.status ?? status,
                }
              : order,
          ),
        );

        // Refresh history
        try {
          await fetchHistory(orderId);
        } catch (historyError) {
          console.warn("History refresh failed:", historyError);
        }

        return updatedOrder;
      } catch (err) {
        console.error("ADMIN ORDER STATUS UPDATE ERROR:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.response?.data?.status?.[0] ||
          "Unable to update order status.";

        setError(message);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchHistory],
  );

  // ========================================================
  // INITIAL FETCH
  // ========================================================

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    fetchOrders();
  }, [autoFetch, fetchOrders]);

  // ========================================================
  // CLEAR SELECTED ORDER
  // ========================================================

  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
    setOrderHistory([]);
    setError(null);
  }, []);

  // ========================================================
  // CLEAR ERROR
  // ========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================
  // RETURN
  // ========================================================

  return {
    // Data
    orders,
    selectedOrder,
    orderHistory,

    // Loading
    loading,
    detailLoading,
    historyLoading,
    actionLoading,

    // Error
    error,

    // API
    fetchOrders,
    fetchOrder,
    fetchHistory,
    updateStatus,

    // Utility
    clearSelectedOrder,
    clearError,
  };
}

export default useAdminOrders;
