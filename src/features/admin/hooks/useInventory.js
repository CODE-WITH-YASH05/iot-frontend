import { useCallback, useState } from "react";
import { adminInventoryApi } from "../api/inventory.api";

export function useInventory() {
  const [inventory, setInventory] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // GET SINGLE INVENTORY
  // =========================================================

  const getInventory = useCallback(async (slug) => {
    if (!slug) {
      throw new Error("Product slug is required.");
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await adminInventoryApi.getInventory(slug);

      const data = response?.data?.data ?? response?.data ?? {};

      setInventory((previous) => ({
        ...previous,
        [slug]: data,
      }));

      return data;
    } catch (error) {
      console.error("GET INVENTORY ERROR:", error);

      setError(getErrorMessage(error, "Failed to load inventory."));

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================
  // GET INVENTORIES FOR ALL PRODUCTS
  // =========================================================

  const getInventories = useCallback(async (products) => {
    if (!Array.isArray(products)) {
      return {};
    }

    if (products.length === 0) {
      setInventory({});
      return {};
    }

    try {
      setIsLoading(true);
      setError("");

      const results = {};

      await Promise.all(
        products.map(async (product) => {
          if (!product?.slug) {
            return;
          }

          // -------------------------------------------------
          // IMPORTANT
          //
          // ProductListSerializer already returns:
          //
          // inventory: {
          //   stock,
          //   reserved_stock,
          //   sold_stock,
          //   low_stock_alert,
          //   available_stock
          // }
          //
          // So first use product.inventory.
          // -------------------------------------------------

          if (product?.inventory && typeof product.inventory === "object") {
            results[product.slug] = product.inventory;

            return;
          }

          // -------------------------------------------------
          // Fallback API call
          // -------------------------------------------------

          try {
            const response = await adminInventoryApi.getInventory(product.slug);

            const data = response?.data?.data ?? response?.data ?? {};

            results[product.slug] = data;
          } catch (error) {
            console.error(`Inventory API error for ${product.slug}:`, error);

            results[product.slug] = {
              stock: 0,
              reserved_stock: 0,
              sold_stock: 0,
              low_stock_alert: 5,
              available_stock: 0,
            };
          }
        }),
      );

      console.log("ALL INVENTORY DATA:", results);

      setInventory(results);

      return results;
    } catch (error) {
      console.error("GET INVENTORIES ERROR:", error);

      setError(getErrorMessage(error, "Failed to load inventories."));

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================
  // UPDATE INVENTORY
  // =========================================================

  const updateInventory = useCallback(async (slug, data) => {
    if (!slug) {
      throw new Error("Product slug is required.");
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await adminInventoryApi.updateInventory(slug, data);

      const updatedInventory = response?.data?.data ?? response?.data ?? {};

      setInventory((previous) => ({
        ...previous,
        [slug]: updatedInventory,
      }));

      return updatedInventory;
    } catch (error) {
      console.error("UPDATE INVENTORY ERROR:", error);

      setError(getErrorMessage(error, "Failed to update inventory."));

      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // =========================================================
  // CLEAR ERROR
  // =========================================================

  const clearError = useCallback(() => {
    setError("");
  }, []);

  // =========================================================
  // CLEAR INVENTORY
  // =========================================================

  const clearInventory = useCallback(() => {
    setInventory({});
  }, []);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    inventory,

    isLoading,
    isSaving,

    error,

    getInventory,
    getInventories,
    updateInventory,

    clearError,
    clearInventory,
  };
}

// =========================================================
// ERROR HELPER
// =========================================================

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return String(data.detail);
  }

  if (data.message) {
    return String(data.message);
  }

  if (typeof data === "object") {
    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "object" && value !== null) {
        messages.push(`${field}: ${JSON.stringify(value)}`);
      } else {
        messages.push(`${field}: ${String(value)}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return fallback;
}
