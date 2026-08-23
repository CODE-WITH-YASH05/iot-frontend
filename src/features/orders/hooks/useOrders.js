import { useCallback, useEffect, useState } from "react";

import orderApi from "../api/orderApi";

export function useOrders({ autoFetch = true } = {}) {
  // =========================================================
  // STATE
  // =========================================================

  const [orders, setOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderHistory, setOrderHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);

  // =========================================================
  // RESPONSE ERROR HELPER
  // =========================================================

  const getErrorMessage = useCallback(
    (err, fallback = "Something went wrong.") => {
      const data = err?.response?.data;

      if (!data) {
        return err?.message || fallback;
      }

      // DRF field errors
      if (typeof data === "object") {
        if (data.message) {
          return data.message;
        }

        if (data.detail) {
          return data.detail;
        }

        if (data.address?.[0]) {
          return data.address[0];
        }

        if (data.coupon?.[0]) {
          return data.coupon[0];
        }

        if (data.status?.[0]) {
          return data.status[0];
        }

        if (data.order?.[0]) {
          return data.order[0];
        }

        if (data.cart?.[0]) {
          return data.cart[0];
        }

        if (data.stock?.[0]) {
          return data.stock[0];
        }

        if (data.inventory?.[0]) {
          return data.inventory[0];
        }

        if (data.price?.[0]) {
          return data.price[0];
        }

        if (data.total?.[0]) {
          return data.total[0];
        }
      }

      return err?.message || fallback;
    },
    [],
  );

  // =========================================================
  // EXTRACT API DATA
  // =========================================================

  const extractData = useCallback((response) => {
    const responseData = response?.data;

    /*
     * Backend success_response:
     *
     * {
     *   success: true,
     *   message: "...",
     *   data: ...
     * }
     *
     * Axios:
     *
     * response.data = {
     *   success: true,
     *   message: "...",
     *   data: ...
     * }
     */

    return responseData?.data ?? responseData;
  }, []);

  // =========================================================
  // FETCH ALL ORDERS
  // =========================================================

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("FETCH ORDERS");

      const response = await orderApi.getOrders();

      console.log("ORDERS API RESPONSE:", response);

      const orderData = extractData(response);

      console.log("ORDERS DATA:", JSON.stringify(orderData, null, 2));

      const orderList = Array.isArray(orderData) ? orderData : [];

      setOrders(orderList);

      return orderList;
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err);

      const message = getErrorMessage(err, "Unable to load orders.");

      setError(message);

      setOrders([]);

      throw err;
    } finally {
      setLoading(false);
    }
  }, [extractData, getErrorMessage]);

  // =========================================================
  // FETCH SINGLE ORDER
  // =========================================================

  const fetchOrder = useCallback(
    async (orderId) => {
      if (!orderId) {
        const message = "Order ID is required.";

        setError(message);

        throw new Error(message);
      }

      try {
        setDetailLoading(true);
        setError(null);

        console.log("FETCH ORDER:", orderId);

        const response = await orderApi.getOrder(orderId);

        console.log("ORDER DETAIL API RESPONSE:", response);

        const orderData = extractData(response);

        console.log("ORDER DETAIL:", JSON.stringify(orderData, null, 2));

        setSelectedOrder(orderData ?? null);

        return orderData;
      } catch (err) {
        console.error("FETCH ORDER ERROR:", err);

        const message = getErrorMessage(err, "Unable to load order.");

        setError(message);

        setSelectedOrder(null);

        throw err;
      } finally {
        setDetailLoading(false);
      }
    },
    [extractData, getErrorMessage],
  );

  // =========================================================
  // FETCH ORDER HISTORY
  // =========================================================

  const fetchOrderHistory = useCallback(
    async (orderId) => {
      if (!orderId) {
        const message = "Order ID is required.";

        setError(message);

        throw new Error(message);
      }

      try {
        setHistoryLoading(true);
        setError(null);

        console.log("FETCH ORDER HISTORY:", orderId);

        const response = await orderApi.getOrderHistory(orderId);

        console.log("ORDER HISTORY API RESPONSE:", response);

        const historyData = extractData(response);

        console.log("ORDER HISTORY:", JSON.stringify(historyData, null, 2));

        const historyList = Array.isArray(historyData) ? historyData : [];

        setOrderHistory(historyList);

        return historyList;
      } catch (err) {
        console.error("FETCH ORDER HISTORY ERROR:", err);

        const message = getErrorMessage(err, "Unable to load order history.");

        setError(message);

        setOrderHistory([]);

        throw err;
      } finally {
        setHistoryLoading(false);
      }
    },
    [extractData, getErrorMessage],
  );

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const cancelOrder = useCallback(
    async (orderId) => {
      if (!orderId) {
        const message = "Order ID is required.";

        setError(message);

        throw new Error(message);
      }

      try {
        setActionLoading(true);
        setError(null);

        console.log("CANCEL ORDER:", orderId);

        const response = await orderApi.cancelOrder(orderId);

        console.log("CANCEL ORDER API RESPONSE:", response);

        const orderData = extractData(response);

        console.log("CANCELLED ORDER:", JSON.stringify(orderData, null, 2));

        // -----------------------------------------------------
        // Update selected order
        // -----------------------------------------------------

        if (orderData) {
          setSelectedOrder(orderData);
        }

        // -----------------------------------------------------
        // Refresh order list
        // -----------------------------------------------------

        await fetchOrders();

        // -----------------------------------------------------
        // Refresh history
        // -----------------------------------------------------

        await fetchOrderHistory(orderId);

        return orderData;
      } catch (err) {
        console.error("CANCEL ORDER ERROR:", err);

        const message = getErrorMessage(err, "Unable to cancel order.");

        setError(message);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [extractData, fetchOrderHistory, fetchOrders, getErrorMessage],
  );

  // =========================================================
  // CHECKOUT / CREATE ORDER
  // =========================================================

  // In the checkout function, update the API call:

  const checkout = useCallback(
    async (addressId, coupon = "") => {
      if (!addressId) {
        const message = "Please select a delivery address.";
        setError(message);
        throw new Error(message);
      }

      try {
        setActionLoading(true);
        setError(null);

        const response = await orderApi.checkout(addressId, coupon); // Pass addressId and coupon

        const orderData = extractData(response);

        if (!orderData) {
          throw new Error("Order was created but no order data was returned.");
        }

        setSelectedOrder(orderData);
        await fetchOrders();

        return orderData;
      } catch (err) {
        console.error("CHECKOUT ERROR:", err);
        const message = getErrorMessage(err, "Unable to create order.");
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [extractData, fetchOrders, getErrorMessage],
  );

  // =========================================================
  // REFRESH CURRENT ORDER
  // =========================================================

  const refreshOrder = useCallback(
    async (orderId) => {
      if (!orderId) {
        return null;
      }

      const orderData = await fetchOrder(orderId);

      return orderData;
    },
    [fetchOrder],
  );

  // =========================================================
  // REFRESH ORDER HISTORY
  // =========================================================

  const refreshOrderHistory = useCallback(
    async (orderId) => {
      if (!orderId) {
        return [];
      }

      const historyData = await fetchOrderHistory(orderId);

      return historyData;
    },
    [fetchOrderHistory],
  );

  // =========================================================
  // CLEAR SELECTED ORDER
  // =========================================================

  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
    setOrderHistory([]);
    setError(null);
  }, []);

  // =========================================================
  // CLEAR ERROR
  // =========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchOrders();
  }, [autoFetch, fetchOrders]);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    // -------------------------------------------------------
    // DATA
    // -------------------------------------------------------

    orders,
    selectedOrder,
    orderHistory,

    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    loading,
    detailLoading,
    historyLoading,
    actionLoading,

    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    error,

    // -------------------------------------------------------
    // ORDER APIs
    // -------------------------------------------------------

    fetchOrders,
    fetchOrder,
    fetchOrderHistory,

    // -------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------

    cancelOrder,
    checkout,

    // -------------------------------------------------------
    // REFRESH
    // -------------------------------------------------------

    refreshOrder,
    refreshOrderHistory,

    // -------------------------------------------------------
    // UTILITY
    // -------------------------------------------------------

    clearSelectedOrder,
    clearError,
  };
}

export default useOrders;
