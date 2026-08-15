import { useMemo } from "react";
import { mapProduct } from "../utils/productMapper";

export function useProductData(product) {
  return useMemo(() => {
    if (!product) {
      return null;
    }

    return mapProduct(product);
  }, [product]);
}
