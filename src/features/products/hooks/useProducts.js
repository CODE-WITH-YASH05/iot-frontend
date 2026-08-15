import { useCallback, useEffect, useState } from "react";
import { productApi } from "../api/product.api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      console.log("FETCH PRODUCTS");

      const response = await productApi.getProducts();

      console.log("PRODUCT API RESPONSE:", response);

      // 🔥 FIX: Check the actual response structure
      // Your API returns: { data: { data: [...] } }
      // or maybe: { data: [...] }
      const responseData = response?.data;

      console.log("RESPONSE DATA:", responseData);

      // Try to find the products array
      let productData =
        responseData?.data || responseData?.results || responseData;

      // If it's an object with a data property, use that
      if (
        productData &&
        typeof productData === "object" &&
        !Array.isArray(productData)
      ) {
        productData = productData.data || productData.results || [];
      }

      console.log("PRODUCT ARRAY:", productData);

      if (!Array.isArray(productData)) {
        console.error("Product data is not an array:", productData);
        throw new Error("Invalid products response.");
      }

      setProducts(productData);
    } catch (err) {
      console.error("PRODUCT FETCH ERROR:", err);

      setIsError(true);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load products.",
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    isError,
    error,
    refetch: fetchProducts,
  };
}
