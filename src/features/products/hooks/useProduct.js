import { useCallback, useEffect, useState } from "react";
import { productApi } from "../api/product.api";

export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      console.log("FETCHING PRODUCT:", slug);

      const response = await productApi.getProductBySlug(slug);

      console.log("PRODUCT API RESPONSE:", response);

      // 🔥 FIX: Extract data from the response correctly
      // Your API returns: { success: true, message: "Success", data: {...} }
      const responseData = response?.data;

      // Get the actual product data from the 'data' field
      const productData = responseData?.data || responseData;

      console.log("PRODUCT DATA:", productData);

      if (!productData) {
        throw new Error("Product not found");
      }

      setProduct(productData);

      return {
        success: true,
        data: productData,
      };
    } catch (error) {
      console.error("PRODUCT FETCH ERROR:", error);

      const responseData = error?.response?.data;

      const message =
        responseData?.message ||
        responseData?.detail ||
        error?.message ||
        "Unable to load product.";

      setIsError(true);
      setError(message);
      setProduct(null);

      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    isError,
    error,
    refetch: fetchProduct,
  };
}
