import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { adminProductsApi } from "../../api/products.api";

import { adminCategoriesApi } from "../../api/categories.api";

import { adminBrandsApi } from "../../api/brands.api";

// =========================================================
// HELPERS
// =========================================================

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  console.error("BACKEND ERROR:", data);

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

    if (messages.length) {
      return messages.join(" | ");
    }
  }

  return fallback;
}

// =========================================================
// COMPONENT
// =========================================================

export default function AddProduct() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  // =======================================================
  // STATES
  // =======================================================

  const [isLoading, setIsLoading] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);

  const [categories, setCategories] = useState([]);

  const [brands, setBrands] = useState([]);

  const [error, setError] = useState("");

  // =======================================================
  // FILE STATES
  // =======================================================

  const [images, setImages] = useState([]);

  const [videos, setVideos] = useState([]);

  // =======================================================
  // SPECIFICATIONS
  // =======================================================

  const [specifications, setSpecifications] = useState([]);

  // =======================================================
  // FORM
  // =======================================================

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",

    description: "",

    price: "",
    discount_price: "",
    cost_price: "",

    sku: "",
    barcode: "",

    stock: "0",

    status: "draft",

    featured: false,
    latest: false,
    trending: false,
  });

  // =======================================================
  // LOAD CATEGORIES + BRANDS
  // =======================================================

  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  // =======================================================
  // LOAD PRODUCT FOR EDIT
  // =======================================================

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  // =======================================================
  // LOAD CATEGORIES / BRANDS
  // =======================================================

  const loadCategoriesAndBrands = async () => {
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        adminCategoriesApi.getCategories(),
        adminBrandsApi.getBrands(),
      ]);

      const categoriesData =
        categoriesResponse?.data?.results ??
        categoriesResponse?.data?.data ??
        categoriesResponse?.data ??
        [];

      const brandsData =
        brandsResponse?.data?.results ??
        brandsResponse?.data?.data ??
        brandsResponse?.data ??
        [];

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (err) {
      console.error("CATEGORY / BRAND ERROR:", err);

      setError(getErrorMessage(err, "Failed to load categories and brands."));
    }
  };

  // =======================================================
  // LOAD PRODUCT
  // =======================================================

  const loadProduct = async () => {
    try {
      setIsInitialLoading(true);

      setError("");

      const response = await adminProductsApi.getProduct(id);

      const product = response?.data?.data ?? response?.data;

      console.log("EDIT PRODUCT:", product);

      setFormData({
        name: product?.name ?? "",

        category: product?.category?.id ?? product?.category ?? "",

        brand: product?.brand?.id ?? product?.brand ?? "",

        description: product?.description ?? "",

        price: product?.price ?? "",

        discount_price: product?.discount_price ?? "",

        cost_price: product?.cost_price ?? "",

        sku: product?.sku ?? "",

        barcode: product?.barcode ?? "",

        stock: product?.inventory?.stock ?? product?.stock ?? "0",

        status: product?.status ?? "draft",

        featured: Boolean(product?.featured),

        latest: Boolean(product?.latest),

        trending: Boolean(product?.trending),
      });

      // Existing specifications
      if (Array.isArray(product?.specifications)) {
        setSpecifications(
          product.specifications.map((item) => ({
            id: item.id,

            name: item.name ?? "",

            value: item.value ?? "",

            sort_order: item.sort_order ?? 0,
          })),
        );
      }
    } catch (err) {
      console.error("LOAD PRODUCT ERROR:", err);

      setError(getErrorMessage(err, "Failed to load product."));
    } finally {
      setIsInitialLoading(false);
    }
  };

  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // =======================================================
  // IMAGE SELECT
  // =======================================================

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 10) {
      setError("Maximum 10 images are allowed.");

      return;
    }

    const invalidFile = selectedFiles.find((file) => {
      const allowed = ["image/jpeg", "image/png", "image/webp"];

      return !allowed.includes(file.type) || file.size > 5 * 1024 * 1024;
    });

    if (invalidFile) {
      setError(
        `${invalidFile.name} is invalid. Only JPG, PNG, WEBP under 5 MB are allowed.`,
      );

      return;
    }

    setImages(selectedFiles);

    setError("");
  };

  // =======================================================
  // VIDEO SELECT
  // =======================================================

  const handleVideoChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 2) {
      setError("Maximum 2 videos are allowed.");

      return;
    }

    const invalidFile = selectedFiles.find((file) => {
      return file.type !== "video/mp4" || file.size > 30 * 1024 * 1024;
    });

    if (invalidFile) {
      setError(
        `${invalidFile.name} is invalid. Only MP4 under 30 MB is allowed.`,
      );

      return;
    }

    setVideos(selectedFiles);

    setError("");
  };

  // =======================================================
  // REMOVE IMAGE
  // =======================================================

  const removeImage = (index) => {
    setImages((previous) => previous.filter((_, i) => i !== index));
  };

  // =======================================================
  // REMOVE VIDEO
  // =======================================================

  const removeVideo = (index) => {
    setVideos((previous) => previous.filter((_, i) => i !== index));
  };

  // =======================================================
  // ADD SPECIFICATION
  // =======================================================

  const addSpecification = () => {
    setSpecifications((previous) => [
      ...previous,

      {
        name: "",
        value: "",
        sort_order: previous.length,
      },
    ]);
  };

  // =======================================================
  // UPDATE SPECIFICATION
  // =======================================================

  const updateSpecification = (index, field, value) => {
    setSpecifications((previous) =>
      previous.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  // =======================================================
  // REMOVE SPECIFICATION
  // =======================================================

  const removeSpecification = (index) => {
    setSpecifications((previous) => previous.filter((_, i) => i !== index));
  };

  // =======================================================
  // BUILD PRODUCT FORM DATA
  // =======================================================

  const buildProductFormData = () => {
    const payload = new FormData();

    payload.append("name", formData.name.trim());

    if (formData.category) {
      payload.append("category", formData.category);
    }

    if (formData.brand) {
      payload.append("brand", formData.brand);
    }

    payload.append("description", formData.description.trim());

    payload.append("price", String(Number(formData.price)));

    if (formData.discount_price !== "") {
      payload.append("discount_price", String(Number(formData.discount_price)));
    }

    if (formData.cost_price !== "") {
      payload.append("cost_price", String(Number(formData.cost_price)));
    }

    if (formData.sku.trim()) {
      payload.append("sku", formData.sku.trim());
    }

    if (formData.barcode.trim()) {
      payload.append("barcode", formData.barcode.trim());
    }

    payload.append("stock", String(Number(formData.stock)));

    payload.append("status", formData.status);

    payload.append("featured", String(Boolean(formData.featured)));

    payload.append("latest", String(Boolean(formData.latest)));

    payload.append("trending", String(Boolean(formData.trending)));

    return payload;
  };

  // =======================================================
  // UPLOAD IMAGES
  // =======================================================

  const uploadProductImages = async (slug) => {
    if (!images.length) {
      return;
    }

    for (let index = 0; index < images.length; index++) {
      const image = images[index];

      const imageData = new FormData();

      imageData.append("image", image);

      imageData.append("alt_text", formData.name.trim());

      imageData.append("sort_order", String(index));

      console.log(`Uploading image ${index + 1}/${images.length}`);

      const response = await adminProductsApi.uploadImage(slug, imageData);

      console.log("IMAGE UPLOADED:", response.data);

      // First image becomes primary
      if (index === 0) {
        const uploadedImage = response?.data?.data ?? response?.data;

        const imageId = uploadedImage?.id;

        if (imageId) {
          try {
            await adminProductsApi.setPrimaryImage(slug, imageId);
          } catch (primaryError) {
            console.warn("Could not set primary image:", primaryError);
          }
        }
      }
    }
  };

  // =======================================================
  // UPLOAD VIDEOS
  // =======================================================

  const uploadProductVideos = async (slug) => {
    if (!videos.length) {
      return;
    }

    for (let index = 0; index < videos.length; index++) {
      const video = videos[index];

      const videoData = new FormData();

      videoData.append("video", video);

      videoData.append("title", `${formData.name} Video ${index + 1}`);

      videoData.append("sort_order", String(index));

      console.log(`Uploading video ${index + 1}/${videos.length}`);

      const response = await adminProductsApi.uploadVideo(slug, videoData);

      console.log("VIDEO UPLOADED:", response.data);
    }
  };

  // =======================================================
  // CREATE SPECIFICATIONS
  // =======================================================

  const createProductSpecifications = async (slug) => {
    const validSpecifications = specifications.filter(
      (item) => item.name?.trim() && item.value?.trim(),
    );

    for (let index = 0; index < validSpecifications.length; index++) {
      const specification = validSpecifications[index];

      await adminProductsApi.createSpecification(slug, {
        name: specification.name.trim(),

        value: specification.value.trim(),

        sort_order: index,
      });
    }
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!formData.name.trim()) {
      setError("Product name is required.");

      return;
    }

    if (formData.price === "" || Number(formData.price) <= 0) {
      setError("Product price must be greater than zero.");

      return;
    }

    if (
      formData.discount_price !== "" &&
      Number(formData.discount_price) > Number(formData.price)
    ) {
      setError("Discount price cannot be greater than product price.");

      return;
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      setError("Stock cannot be negative.");

      return;
    }

    setIsLoading(true);

    try {
      // ===================================================
      // EDIT
      // ===================================================

      if (isEditMode) {
        const payload = buildProductFormData();

        console.log("UPDATING PRODUCT:", id);

        const response = await adminProductsApi.updateProduct(id, payload);

        console.log("PRODUCT UPDATED:", response.data);

        navigate("/admin/products", {
          replace: true,
        });

        return;
      }

      // ===================================================
      // CREATE PRODUCT
      // ===================================================

      console.log("CREATING PRODUCT...");

      const payload = buildProductFormData();

      // IMPORTANT:
      // Images / videos / specifications
      // are NOT appended here.

      const response = await adminProductsApi.createProduct(payload);

      console.log("PRODUCT CREATE RESPONSE:", response.data);

      const createdProduct = response?.data?.data ?? response?.data;

      const productSlug = createdProduct?.slug;

      if (!productSlug) {
        console.error("CREATE PRODUCT RESPONSE:", response.data);

        throw new Error(
          "Product was created but backend did not return product slug.",
        );
      }

      console.log("PRODUCT SLUG:", productSlug);

      // =================================================
      // IMAGES
      // =================================================

      if (images.length) {
        await uploadProductImages(productSlug);
      }

      // =================================================
      // VIDEOS
      // =================================================

      if (videos.length) {
        await uploadProductVideos(productSlug);
      }

      // =================================================
      // SPECIFICATIONS
      // =================================================

      if (specifications.length) {
        await createProductSpecifications(productSlug);
      }

      // =================================================
      // SUCCESS
      // =================================================

      navigate("/admin/products", {
        replace: true,
      });
    } catch (err) {
      console.error("PRODUCT SAVE ERROR:", err);

      console.error("STATUS:", err?.response?.status);

      console.error("BACKEND RESPONSE:", err?.response?.data);

      setError(
        getErrorMessage(
          err,
          isEditMode
            ? "Failed to update product."
            : "Failed to create product.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOADING
  // =======================================================

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {isEditMode
            ? "Update product information"
            : "Create a new product for your IoT store"}
        </p>
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600">
              error
            </span>

            <div>
              <p className="font-semibold text-red-700">
                Unable to save product
              </p>

              <p className="text-sm text-red-600 mt-1 break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================================================= */}
        {/* BASIC INFORMATION */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PRODUCT NAME */}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ESP32 Development Board"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BRAND */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand
              </label>

              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              >
                <option value="">Select Brand</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SKU
              </label>

              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="IOT-ESP32-001"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {/* BARCODE */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barcode
              </label>

              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="8901234567890"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* PRICE & INVENTORY */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Price & Inventory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PRICE */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹) *
              </label>

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="999.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {/* DISCOUNT */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Price
              </label>

              <input
                type="number"
                name="discount_price"
                min="0"
                step="0.01"
                value={formData.discount_price}
                onChange={handleChange}
                placeholder="899.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {/* COST */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost Price
              </label>

              <input
                type="number"
                name="cost_price"
                min="0"
                step="0.01"
                value={formData.cost_price}
                onChange={handleChange}
                placeholder="600.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {/* STOCK */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock *
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {/* STATUS */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
              >
                <option value="draft">Draft</option>

                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* FLAGS */}

          <div className="flex flex-wrap gap-6 mt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />

              <span className="text-sm font-medium text-gray-700">
                Featured
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="latest"
                checked={formData.latest}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />

              <span className="text-sm font-medium text-gray-700">Latest</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="trending"
                checked={formData.trending}
                onChange={handleChange}
                className="w-5 h-5 rounded"
              />

              <span className="text-sm font-medium text-gray-700">
                Trending
              </span>
            </label>
          </div>
        </div>

        {/* ================================================= */}
        {/* IMAGES */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Product Images
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG or WEBP • Maximum 5 MB each • Maximum 10
              </p>
            </div>
          </div>

          <input
            id="product-images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />

          <label
            htmlFor="product-images"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition"
          >
            <span className="material-symbols-outlined text-4xl text-indigo-500">
              cloud_upload
            </span>

            <p className="mt-3 font-semibold text-gray-700">
              Click to upload images
            </p>

            <p className="text-sm text-gray-400 mt-1">Select up to 10 images</p>
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
              {images.map((image, index) => (
                <div key={`${image.name}-${index}`} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    className="w-full aspect-square object-cover rounded-xl border"
                  />

                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-lg">
                      Primary
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>

                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* VIDEOS */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900">Product Videos</h3>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            MP4 only • Maximum 30 MB each • Maximum 2 videos
          </p>

          <input
            id="product-videos"
            type="file"
            accept="video/mp4"
            multiple
            onChange={handleVideoChange}
            className="hidden"
          />

          <label
            htmlFor="product-videos"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition"
          >
            <span className="material-symbols-outlined text-4xl text-purple-500">
              video_library
            </span>

            <p className="mt-3 font-semibold text-gray-700">
              Click to upload videos
            </p>

            <p className="text-sm text-gray-400 mt-1">MP4 files only</p>
          </label>

          {videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {videos.map((video, index) => (
                <div
                  key={`${video.name}-${index}`}
                  className="relative border rounded-xl overflow-hidden bg-gray-50"
                >
                  <video
                    src={URL.createObjectURL(video)}
                    controls
                    className="w-full h-52 object-cover"
                  />

                  <div className="p-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {video.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="ml-3 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* SPECIFICATIONS */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Product Specifications
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Example: Voltage → 5V
              </p>
            </div>

            <button
              type="button"
              onClick={addSpecification}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
            >
              + Add Specification
            </button>
          </div>

          {specifications.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <span className="material-symbols-outlined text-gray-300 text-4xl">
                tune
              </span>

              <p className="text-gray-400 text-sm mt-2">
                No specifications added
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {specifications.map((specification, index) => (
                <div
                  key={specification.id ?? index}
                  className="flex flex-col md:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={specification.name}
                    onChange={(event) =>
                      updateSpecification(index, "name", event.target.value)
                    }
                    placeholder="Specification name"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
                  />

                  <input
                    type="text"
                    value={specification.value}
                    onChange={(event) =>
                      updateSpecification(index, "value", event.target.value)
                    }
                    placeholder="Specification value"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="px-4 py-3 text-red-600 bg-red-50 rounded-xl"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={isLoading}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[190px]"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    {isEditMode ? "save" : "add"}
                  </span>

                  {isEditMode ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
