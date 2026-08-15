import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminBrandsApi } from "../api/brands.api";

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    country: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [brandToDelete, setBrandToDelete] = useState(null);

  // =====================================================
  // NORMALIZE API RESPONSE
  // =====================================================

  const extractArray = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.data?.results)) {
      return data.data.results;
    }

    return [];
  };

  // =====================================================
  // FETCH BRANDS
  // =====================================================

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await adminBrandsApi.getBrands();

      console.log("BRANDS API RESPONSE:", response.data);

      setBrands(extractArray(response));
    } catch (err) {
      console.error("Failed to fetch brands:", err);

      setBrands([]);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load brands.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // OPEN CREATE
  // =====================================================

  const openCreateModal = () => {
    setEditingBrand(null);

    setFormData({
      name: "",
      description: "",
      country: "",
    });

    setError("");
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (brand) => {
    setEditingBrand(brand);

    setFormData({
      name: brand.name || "",
      description: brand.description || "",
      country: brand.country || "",
    });

    setError("");
    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (isSaving) return;

    setShowModal(false);
    setEditingBrand(null);

    setFormData({
      name: "",
      description: "",
      country: "",
    });

    setError("");
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      setError("Brand name is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name,
        description: formData.description.trim(),
        country: formData.country.trim(),
      };

      if (editingBrand) {
        await adminBrandsApi.updateBrand(editingBrand.id, payload);
      } else {
        await adminBrandsApi.createBrand(payload);
      }

      closeModal();

      await fetchBrands();
    } catch (err) {
      console.error("Failed to save brand:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to save brand.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      setIsSaving(true);
      setError("");

      await adminBrandsApi.deleteBrand(brandToDelete.id);

      setShowDeleteModal(false);
      setBrandToDelete(null);

      await fetchBrands();
    } catch (err) {
      console.error("Failed to delete brand:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete brand.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brands</h2>

          <p className="text-sm text-gray-500">Manage product brands</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Brand
        </button>
      </div>

      {/* ERROR */}

      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* EMPTY */}

      {brands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-indigo-600">B</span>
          </div>

          <h3 className="text-lg font-bold text-gray-900">No brands found</h3>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Create your first product brand.
          </p>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
          >
            Create Brand
          </button>
        </div>
      ) : (
        /* BRANDS */

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-indigo-600">
                      {brand.name?.charAt(0)?.toUpperCase() || "B"}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900">{brand.name}</h3>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {brand.description || "No description"}
                  </p>

                  {brand.country && (
                    <p className="text-xs text-gray-400 mt-2">
                      📍 {brand.country}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {brand.product_count || 0} products
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(brand)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <span className="material-symbols-outlined text-base">
                      edit
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setBrandToDelete(brand);
                      setShowDeleteModal(true);
                    }}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-base">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBrand ? "Edit Brand" : "Add Brand"}
              </h3>

              <button
                onClick={closeModal}
                disabled={isSaving}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Name *
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400"
                  placeholder="India"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 resize-none"
                  placeholder="Enter brand description"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingBrand ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {showDeleteModal && brandToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 text-3xl">
                  warning
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Brand
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {brandToDelete.name}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBrandToDelete(null);
                  }}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {isSaving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
