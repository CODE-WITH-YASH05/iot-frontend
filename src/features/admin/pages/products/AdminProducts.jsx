import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { adminProductsApi } from "../../api/products.api";
import ImageWithFallback from "../../../../components/ImageWithFallback";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const productsPerPage = 10;

  // ============================================================
  // FETCH PRODUCTS
  // ============================================================

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminProductsApi.getProducts();

      console.log("ADMIN PRODUCTS RESPONSE:", response);
      console.log("ADMIN PRODUCTS DATA:", response?.data);

      const responseData = response?.data;

      /*
       * Backend response can be:
       *
       * 1. [...]
       *
       * 2. { data: [...] }
       *
       * 3. { data: { data: [...] } }
       *
       * 4. { results: [...] }
       */

      let productData =
        responseData?.data?.data ??
        responseData?.data ??
        responseData?.results ??
        responseData ??
        [];

      console.log("FINAL PRODUCT DATA:", productData);

      if (!Array.isArray(productData)) {
        console.error(
          "Invalid products response. Expected array:",
          productData,
        );

        throw new Error("Invalid products response from server.");
      }

      setProducts(productData);
    } catch (err) {
      console.error("Failed to fetch products:", err);

      setProducts([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const name = product?.name?.toLowerCase() || "";
      const sku = product?.sku?.toLowerCase() || "";

      return name.includes(query) || sku.includes(query);
    });
  }, [products, searchQuery]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const currentProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * productsPerPage,
    safeCurrentPage * productsPerPage,
  );

  // ============================================================
  // SEARCH PAGE RESET
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!productToDelete) {
      return;
    }

    try {
      setIsDeleting(true);

      /*
       * IMPORTANT:
       *
       * Backend route:
       *
       * DELETE /products/<slug>/
       *
       * So use slug, NOT id.
       */

      await adminProductsApi.deleteProduct(productToDelete.slug);

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== productToDelete.id),
      );

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Failed to delete product:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete product.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>

          <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>

        <Link
          to="/admin/products/add"
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Product
        </Link>
      </div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">
              error
            </span>

            <p className="text-sm text-red-600">{error}</p>
          </div>

          <button
            type="button"
            onClick={fetchProducts}
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
            search
          </span>

          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-16 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-5xl">
                      inventory_2
                    </span>

                    <p className="mt-3 text-gray-500 font-medium">
                      No products found
                    </p>

                    {searchQuery && (
                      <p className="text-sm text-gray-400 mt-1">
                        Try another search term.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* PRODUCT */}

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={
                              product?.images?.find(
                                (image) => image?.is_primary,
                              )?.image ||
                              product?.images?.[0]?.image ||
                              product?.image ||
                              null
                            }
                            alt={product?.name}
                            className="w-full h-full object-cover"
                            fallbackSrc="/placeholder-image.png"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {product?.name || "Unnamed Product"}
                          </p>

                          <p className="text-xs text-gray-400">
                            SKU: {product?.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {typeof product?.category === "object"
                        ? product?.category?.name || "N/A"
                        : product?.category || "N/A"}
                    </td>

                    {/* PRICE */}

                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ₹
                      {Number(
                        product?.discount_price ?? product?.price ?? 0,
                      ).toLocaleString("en-IN")}
                    </td>

                    {/* STOCK */}

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          Number(product?.stock || 0) > 0
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product?.stock || 0}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product?.status === "published"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product?.status || "draft"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* EDIT */}

                        <Link
                          to={`/admin/products/${product.slug}`}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit product"
                        >
                          <span className="material-symbols-outlined text-base">
                            edit
                          </span>
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                          title="Delete product"
                        >
                          <span className="material-symbols-outlined text-base">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ==================================================== */}
        {/* PAGINATION */}
        {/* ==================================================== */}

        {filteredProducts.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Showing{" "}
              {filteredProducts.length === 0
                ? 0
                : (safeCurrentPage - 1) * productsPerPage + 1}{" "}
              to{" "}
              {Math.min(
                safeCurrentPage * productsPerPage,
                filteredProducts.length,
              )}{" "}
              of {filteredProducts.length} products
            </p>

            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.max(1, safeCurrentPage - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        safeCurrentPage === page
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================== */}
      {/* DELETE MODAL */}
      {/* ====================================================== */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 text-3xl">
                  warning
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Product
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {productToDelete?.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeleting) {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
