import React, { useEffect, useMemo, useState } from "react";

import { adminProductsApi } from "../api/products.api";
import { useInventory } from "../hooks/useInventory";

export default function AdminInventory() {
  // =========================================================
  // INVENTORY HOOK
  // =========================================================

  const { inventory, isSaving, getInventories, updateInventory } =
    useInventory();

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [productError, setProductError] = useState("");

  // =========================================================
  // SEARCH
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================
  // EDIT MODAL
  // =========================================================

  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    stock: 0,
    low_stock_alert: 5,
  });

  // =========================================================
  // SUCCESS
  // =========================================================

  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // LOAD PRODUCTS + INVENTORY
  // =========================================================

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoadingProducts(true);
      setProductError("");
      setSuccessMessage("");

      // -----------------------------------------------------
      // GET PRODUCTS
      // -----------------------------------------------------

      const response = await adminProductsApi.getProducts();

      console.log("ADMIN PRODUCTS RESPONSE:", response);

      const responseData = response?.data;

      /*
       * Supported responses:
       *
       * [...]
       *
       * { results: [...] }
       *
       * { data: [...] }
       *
       * { data: { data: [...] } }
       */

      const productData =
        responseData?.data?.data ??
        responseData?.data ??
        responseData?.results ??
        responseData ??
        [];

      console.log("FINAL PRODUCT DATA:", productData);

      if (!Array.isArray(productData)) {
        throw new Error("Invalid products response from server.");
      }

      setProducts(productData);

      // -----------------------------------------------------
      // GET INVENTORY FOR ALL PRODUCTS
      // -----------------------------------------------------

      if (productData.length > 0) {
        await getInventories(productData);
      }
    } catch (error) {
      console.error("LOAD INVENTORY ERROR:", error);

      setProductError(getErrorMessage(error, "Failed to load inventory."));
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // =========================================================
  // ERROR HELPER
  // =========================================================

  const getErrorMessage = (error, fallback) => {
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
  };

  // =========================================================
  // SEARCH
  // =========================================================

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

  // =========================================================
  // OPEN UPDATE MODAL
  // =========================================================

  const openUpdateModal = (product) => {
    const productInventory = inventory?.[product.slug] || {};

    setEditingProduct(product);

    setFormData({
      stock: Number(productInventory?.stock ?? 0),

      low_stock_alert: Number(productInventory?.low_stock_alert ?? 5),
    });

    setProductError("");
    setSuccessMessage("");
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeUpdateModal = () => {
    if (isSaving) {
      return;
    }

    setEditingProduct(null);

    setFormData({
      stock: 0,
      low_stock_alert: 5,
    });
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setProductError("");
    setSuccessMessage("");
  };

  // =========================================================
  // UPDATE INVENTORY
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    setProductError("");
    setSuccessMessage("");

    // -------------------------------------------------------
    // CONVERT VALUES
    // -------------------------------------------------------

    const stock = Number(formData.stock);

    const lowStockAlert = Number(formData.low_stock_alert);

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!Number.isFinite(stock)) {
      setProductError("Please enter a valid stock quantity.");

      return;
    }

    if (stock < 0) {
      setProductError("Stock cannot be negative.");

      return;
    }

    if (!Number.isFinite(lowStockAlert)) {
      setProductError("Please enter a valid low stock alert.");

      return;
    }

    if (lowStockAlert < 0) {
      setProductError("Low stock alert cannot be negative.");

      return;
    }

    // -------------------------------------------------------
    // RESERVED STOCK CHECK
    // -------------------------------------------------------

    const currentInventory = inventory?.[editingProduct.slug] || {};

    const reservedStock = Number(currentInventory?.reserved_stock ?? 0);

    if (stock < reservedStock) {
      setProductError(
        `Stock cannot be less than reserved stock (${reservedStock}).`,
      );

      return;
    }

    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    try {
      const updatedInventory = await updateInventory(editingProduct.slug, {
        stock,
        low_stock_alert: lowStockAlert,
      });

      console.log("UPDATED INVENTORY:", updatedInventory);

      setSuccessMessage("Inventory updated successfully.");

      setEditingProduct(null);

      setFormData({
        stock: 0,
        low_stock_alert: 5,
      });
    } catch (error) {
      console.error("UPDATE INVENTORY ERROR:", error);

      setProductError(getErrorMessage(error, "Failed to update inventory."));
    }
  };

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (product) => {
    const data = inventory?.[product.slug] || {};

    const availableStock = Number(data?.available_stock ?? data?.stock ?? 0);

    const lowStockAlert = Number(data?.low_stock_alert ?? 5);

    if (availableStock <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (availableStock <= lowStockAlert) {
      return {
        label: "Low Stock",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-100 text-green-700",
    };
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-6 pb-10">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage product stock and inventory
          </p>
        </div>

        <button
          type="button"
          onClick={loadInventory}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh
        </button>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {productError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600">
              error
            </span>

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Inventory Error
              </p>

              <p className="text-sm text-red-600 mt-1">{productError}</p>
            </div>

            <button
              type="button"
              onClick={() => setProductError("")}
              className="text-red-500 hover:text-red-700"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SUCCESS */}
      {/* ================================================== */}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">
              check_circle
            </span>

            <p className="text-sm font-semibold text-green-700">
              {successMessage}
            </p>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SEARCH */}
      {/* ================================================== */}

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search product by name or SKU..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      {/* ================================================== */}
      {/* SUMMARY */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {products.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">In Stock</p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {
              products.filter(
                (product) =>
                  Number(
                    inventory?.[product.slug]?.available_stock ??
                      inventory?.[product.slug]?.stock ??
                      0,
                  ) > 0,
              ).length
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Low Stock</p>

          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {
              products.filter((product) => {
                const data = inventory?.[product.slug] || {};

                const available = Number(
                  data?.available_stock ?? data?.stock ?? 0,
                );

                const alert = Number(data?.low_stock_alert ?? 5);

                return available > 0 && available <= alert;
              }).length
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Out of Stock</p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {
              products.filter(
                (product) =>
                  Number(
                    inventory?.[product.slug]?.available_stock ??
                      inventory?.[product.slug]?.stock ??
                      0,
                  ) <= 0,
              ).length
            }
          </p>
        </div>
      </div>

      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sold
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Available
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
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
                filteredProducts.map((product) => {
                  const data = inventory?.[product.slug] || {};

                  const status = getStockStatus(product);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* PRODUCT */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {product?.name || "Unnamed Product"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            SKU: {product?.sku || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* STOCK */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {data?.stock ?? 0}
                        </span>
                      </td>

                      {/* RESERVED */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {data?.reserved_stock ?? 0}
                        </span>
                      </td>

                      {/* SOLD */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {data?.sold_stock ?? 0}
                        </span>
                      </td>

                      {/* AVAILABLE */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-indigo-600">
                          {data?.available_stock ?? 0}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openUpdateModal(product)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-sm font-semibold"
                        >
                          <span className="material-symbols-outlined text-base">
                            edit
                          </span>
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================== */}
      {/* UPDATE MODAL */}
      {/* ================================================== */}

      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* MODAL HEADER */}

            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Update Inventory
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct?.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeUpdateModal}
                  disabled={isSaving}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* MODAL BODY */}

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                {/* MODAL ERROR */}

                {productError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-600">{productError}</p>
                  </div>
                )}

                {/* STOCK */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                  />

                  <p className="text-xs text-gray-400 mt-1">
                    Stock cannot be lower than reserved stock.
                  </p>
                </div>

                {/* LOW STOCK ALERT */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Low Stock Alert
                  </label>

                  <input
                    type="number"
                    name="low_stock_alert"
                    min="0"
                    step="1"
                    value={formData.low_stock_alert}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                  />
                </div>

                {/* CURRENT INFORMATION */}

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Reserved Stock
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {inventory?.[editingProduct.slug]?.reserved_stock ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Sold Stock</span>

                    <span className="text-sm font-semibold text-gray-900">
                      {inventory?.[editingProduct.slug]?.sold_stock ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Available Stock
                    </span>

                    <span className="text-sm font-bold text-indigo-600">
                      {inventory?.[editingProduct.slug]?.available_stock ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        save
                      </span>
                      Save Inventory
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
