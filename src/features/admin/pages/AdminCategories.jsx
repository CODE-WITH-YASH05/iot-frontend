import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminCategoriesApi } from "../api/categories.api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // =========================================================
  // API RESPONSE NORMALIZER
  // =========================================================

  const extractArray = (response) => {
    const data = response?.data;

    // Direct array
    if (Array.isArray(data)) {
      return data;
    }

    // { data: [] }
    if (Array.isArray(data?.data)) {
      return data.data;
    }

    // { results: [] }
    if (Array.isArray(data?.results)) {
      return data.results;
    }

    // { data: { results: [] } }
    if (Array.isArray(data?.data?.results)) {
      return data.data.results;
    }

    return [];
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await adminCategoriesApi.getCategories();

      console.log("CATEGORIES API RESPONSE:", response.data);

      const categoryList = extractArray(response);

      setCategories(categoryList);
    } catch (err) {
      console.error("Failed to fetch categories:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to load categories.";

      setError(message);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (isSaving) return;

    setShowModal(false);
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name,
        description,
      };

      console.log("CATEGORY PAYLOAD:", payload);

      if (editingCategory) {
        await adminCategoriesApi.updateCategory(editingCategory.id, payload);
      } else {
        await adminCategoriesApi.createCategory(payload);
      }

      closeModal();

      await fetchCategories();
    } catch (err) {
      console.error("Failed to save category:", err);

      const apiError = err?.response?.data;

      let message = "Failed to save category.";

      if (typeof apiError?.message === "string") {
        message = apiError.message;
      } else if (typeof apiError?.detail === "string") {
        message = apiError.detail;
      } else if (apiError && typeof apiError === "object") {
        const firstError = Object.entries(apiError).find(
          ([, value]) => Array.isArray(value) && value.length > 0,
        );

        if (firstError) {
          message = `${firstError[0]}: ${firstError[1][0]}`;
        }
      }

      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsSaving(true);
      setError("");

      await adminCategoriesApi.deleteCategory(categoryToDelete.id);

      setShowDeleteModal(false);
      setCategoryToDelete(null);

      await fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to delete category.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>

          <p className="text-sm text-gray-500">Manage product categories</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Category
        </button>
      </div>

      {/* GLOBAL ERROR */}

      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">
              error_outline
            </span>

            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-indigo-600 text-3xl">
              category
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            No categories found
          </h3>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Create your first product category.
          </p>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
          >
            Create Category
          </button>
        </div>
      ) : (
        /* CATEGORY GRID */

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
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
                    <span className="material-symbols-outlined text-indigo-600 text-2xl">
                      category
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 truncate">
                    {category.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {category.description || "No description"}
                  </p>

                  <p className="text-xs text-gray-400 mt-3">
                    {category.product_count || 0} products
                  </p>

                  {category.is_active !== undefined && (
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        category.is_active
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>

                {/* ACTIONS */}

                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-base">
                      edit
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCategoryToDelete(category);
                      setShowDeleteModal(true);
                    }}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                    title="Delete"
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

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

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
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {editingCategory
                    ? "Update category details"
                    : "Create a new product category"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* MODAL ERROR */}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name *
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  maxLength={255}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all disabled:opacity-60"
                  placeholder="e.g. Arduino Boards"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  rows={4}
                  maxLength={1000}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none disabled:opacity-60"
                  placeholder="Enter category description"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        {editingCategory ? "save" : "add"}
                      </span>

                      {editingCategory ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDeleteModal && categoryToDelete && (
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
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-600 text-3xl">
                  warning
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Category
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {categoryToDelete.name}
                </span>
                ?
                <br />
                <span className="text-red-500 text-xs">
                  This action cannot be undone.
                </span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);
                  }}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      Delete
                    </>
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
