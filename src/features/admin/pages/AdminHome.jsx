import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Settings,
  RefreshCw,
  Home,
  Layout,
  TrendingUp,
  Users,
  Zap,
  ShoppingBag,
  Save,
  Power,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  Star,
  BarChart3,
  Map,
  Layers,
  Info,
  HelpCircle,
} from "lucide-react";

import adminClient from "../../../api/admin-client";
import { useAdminHome } from "../hooks/useAdminHome";

// ==========================================================
// BASE URL
// ==========================================================

const ADMIN_HOME_BASE = "/api/v1/home/admin";

// ==========================================================
// SECTIONS
// ==========================================================

const SECTIONS = [
  {
    id: "hero",
    label: "Hero Section",
    description: "Main banner and headline of your home page",
    icon: Home,
    enabledField: "hero_section_active",
  },
  {
    id: "adventures",
    label: "Adventures",
    description: "Three main action cards: Learn, Build, Shop",
    icon: Layout,
    enabledField: "adventures_section_active",
  },
  {
    id: "journey",
    label: "Learning Journey",
    description: "4-step learning path explanation",
    icon: TrendingUp,
    enabledField: "journey_section_active",
  },
  {
    id: "products",
    label: "Products Section",
    description: "Featured products showcase from your store",
    icon: ShoppingBag,
    enabledField: "products_section_active",
  },
  {
    id: "projects",
    label: "Projects Section",
    description: "IoT project cards for beginners",
    icon: Zap,
    enabledField: "projects_section_active",
  },
  {
    id: "contact",
    label: "Contact Section",
    description: "Call-to-action for contact/sales",
    icon: Users,
    enabledField: "contact_section_active",
  },
];

// ==========================================================
// ITEM TYPES
// ==========================================================

const ITEM_TYPES = [
  {
    id: "banners",
    label: "Hero Banners",
    description: "Sliding banners at the top of your home page",
    endpoint: "banners",
    icon: Home,
    image: true,
    fields: ["Title", "Eyebrow", "Description", "Button Text", "Button Link"],
  },
  {
    id: "adventures",
    label: "Adventure Cards",
    description: "Learn, Build, Shop - main action cards",
    endpoint: "adventures",
    icon: Map,
    image: true,
    fields: [
      "Icon",
      "Eyebrow",
      "Title",
      "Description",
      "Action Text",
      "Action Link",
      "Colors",
    ],
  },
  {
    id: "features",
    label: "Feature Items",
    description: "Feature icons and text (Shipping, Warranty, etc.)",
    endpoint: "features",
    icon: Star,
    image: false,
    fields: ["Icon", "Title", "Description", "Colors"],
  },
  {
    id: "stats",
    label: "Statistics",
    description: "Numbers shown in hero section (Users, Devices, etc.)",
    endpoint: "stats",
    icon: BarChart3,
    image: false,
    fields: ["Value", "Suffix", "Label", "Icon"],
  },
  {
    id: "journey",
    label: "Journey Steps",
    description: "4 steps explaining the learning path",
    endpoint: "journey",
    icon: TrendingUp,
    image: true,
    fields: ["Number", "Title", "Description", "Icon", "Color"],
  },
  {
    id: "product-uses",
    label: "Product Use Cases",
    description: "How products are used (Smart Home, Garden, etc.)",
    endpoint: "product-uses",
    icon: ShoppingBag,
    image: true,
    fields: ["Icon", "Title", "Description", "Feature"],
  },
  {
    id: "projects",
    label: "Project Cards",
    description: "IoT project examples for beginners",
    endpoint: "projects",
    icon: Layers,
    image: true,
    fields: ["Title", "Description", "Tag", "Icon", "Tone"],
  },
];

// ==========================================================
// RESPONSE NORMALIZER
// ==========================================================

const normalizeResponse = (response) => {
  return response?.data?.data || response?.data || null;
};

// ==========================================================
// ERROR HELPER
// ==========================================================

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || "Something went wrong";
  if (typeof data === "string") return data;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data === "object") {
    const messages = Object.values(data)
      .flat()
      .filter(Boolean)
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
    if (messages.length) return messages.join(", ");
  }
  return "Something went wrong";
};

// ==========================================================
// HELPER COMPONENTS
// ==========================================================

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  max,
  placeholder,
  help,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
      />
      {help && <p className="mt-1 text-xs text-gray-400">{help}</p>}
    </div>
  );
}

function FormTextarea({
  label,
  name,
  value,
  onChange,
  rows = 3,
  placeholder,
  help,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
      />
      {help && <p className="mt-1 text-xs text-gray-400">{help}</p>}
    </div>
  );
}

function SectionToggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-14 rounded-full transition-all ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-8" : "left-1"
        }`}
      />
    </button>
  );
}

function ImagePreview({ image, onRemove }) {
  if (!image) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400">
        <div className="text-center">
          <ImageIcon size={32} className="mx-auto mb-2" />
          <p className="text-sm">No image uploaded</p>
          <p className="text-xs">Upload or add image URL below</p>
        </div>
      </div>
    );
  }

  const src = typeof image === "string" ? image : URL.createObjectURL(image);

  return (
    <div className="relative">
      <img
        src={src}
        alt="Preview"
        className="h-48 w-full rounded-xl border border-gray-200 object-cover"
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// ==========================================================
// HOME ITEM MANAGER
// ==========================================================

function HomeItemsManager({ itemType, refreshHome }) {
  const config = useMemo(
    () => ITEM_TYPES.find((item) => item.id === itemType),
    [itemType],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      const response = await adminClient.get(
        `${ADMIN_HOME_BASE}/${config.endpoint}/`,
      );
      const data = normalizeResponse(response);
      setItems(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ is_active: true, display_order: items.length + 1 });
    setSelectedImage(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setSelectedImage(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({});
    setSelectedImage(null);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (["id", "image", "image_display"].includes(key)) return;
        data.append(key, value);
      });

      if (selectedImage) {
        data.append("image", selectedImage);
      }

      if (editingItem) {
        await adminClient.patch(
          `${ADMIN_HOME_BASE}/${config.endpoint}/${editingItem.id}/`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Item updated successfully ✅");
      } else {
        await adminClient.post(`${ADMIN_HOME_BASE}/${config.endpoint}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item added successfully ✅");
      }

      closeModal();
      await fetchItems();
      if (refreshHome) await refreshHome();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title || item.label || "this item"}"?`))
      return;
    try {
      await adminClient.delete(
        `${ADMIN_HOME_BASE}/${config.endpoint}/${item.id}/`,
      );
      toast.success("Item deleted successfully 🗑️");
      await fetchItems();
      if (refreshHome) await refreshHome();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleActive = async (item) => {
    const previousItems = [...items];
    const newStatus = item.is_active === false;

    setItems((prev) =>
      prev.map((current) =>
        current.id === item.id ? { ...current, is_active: newStatus } : current,
      ),
    );

    try {
      await adminClient.patch(
        `${ADMIN_HOME_BASE}/${config.endpoint}/${item.id}/`,
        { is_active: newStatus },
      );
      toast.success(newStatus ? "Item activated ✅" : "Item deactivated ⛔");
      await fetchItems();
      if (refreshHome) await refreshHome();
    } catch (error) {
      setItems(previousItems);
      toast.error(getErrorMessage(error));
    }
  };

  const getItemImage = (item) =>
    item.image_display || item.image || item.image_url || null;

  const renderFields = () => {
    const commonFields = (
      <>
        <FormInput
          label="Display Order"
          name="display_order"
          type="number"
          value={formData.display_order}
          onChange={handleInputChange}
          min="0"
          help="Lower numbers appear first"
        />
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Status
          </label>
          <div className="flex h-[46px] items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4">
            <span className="text-sm font-semibold">
              {formData.is_active !== false ? "🟢 Active" : "🔴 Inactive"}
            </span>
            <SectionToggle
              checked={formData.is_active !== false}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: prev.is_active === false ? true : false,
                }))
              }
            />
          </div>
        </div>
      </>
    );

    switch (itemType) {
      case "banners":
        return (
          <>
            <FormInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              help="Main heading"
            />
            <FormInput
              label="Eyebrow"
              name="eyebrow"
              value={formData.eyebrow}
              onChange={handleInputChange}
              help="Small text above title (e.g., 'Today's experiment')"
            />
            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                help="Short description of the banner"
              />
            </div>
            <FormInput
              label="Button Text"
              name="button_text"
              value={formData.button_text}
              onChange={handleInputChange}
              help="Text on the button (e.g., 'Shop Now')"
            />
            <FormInput
              label="Button Link"
              name="button_link"
              value={formData.button_link}
              onChange={handleInputChange}
              help="Where button goes (e.g., '/shop')"
            />
            {commonFields}
          </>
        );

      case "adventures":
        return (
          <>
            <FormInput
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              help="Material icon name"
            />
            <FormInput
              label="Eyebrow"
              name="eyebrow"
              value={formData.eyebrow}
              onChange={handleInputChange}
              help="Small tagline"
            />
            <FormInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              help="Card title (Learn, Build, Shop)"
            />
            <FormInput
              label="Action Text"
              name="action_text"
              value={formData.action_text}
              onChange={handleInputChange}
              help="Button text (e.g., 'Explore lessons')"
            />
            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                help="Card description"
              />
            </div>
            <FormInput
              label="Action Link"
              name="action_link"
              value={formData.action_link}
              onChange={handleInputChange}
              help="Where the button goes (e.g., '#learn')"
            />
            <FormInput
              label="Color From"
              name="color_from"
              value={formData.color_from}
              onChange={handleInputChange}
              placeholder="#4f46e5"
              help="Gradient start color (hex code)"
            />
            <FormInput
              label="Color To"
              name="color_to"
              value={formData.color_to}
              onChange={handleInputChange}
              placeholder="#9333ea"
              help="Gradient end color (hex code)"
            />
            {commonFields}
          </>
        );

      case "features":
        return (
          <>
            <FormInput
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              help="Emoji or icon text"
            />
            <FormInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              help="Feature name"
            />
            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                help="Feature description"
              />
            </div>
            <FormInput
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              help="Text color (e.g., 'text-blue-600')"
            />
            <FormInput
              label="Background Color"
              name="bg_color"
              value={formData.bg_color}
              onChange={handleInputChange}
              help="Background color (e.g., 'bg-blue-50')"
            />
            {commonFields}
          </>
        );

      case "stats":
        return (
          <>
            <FormInput
              label="Value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleInputChange}
              help="The number (e.g., 50000)"
            />
            <FormInput
              label="Suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleInputChange}
              placeholder="+"
              help="Symbol after number (e.g., '+')"
            />
            <FormInput
              label="Label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              help="What this stat represents"
            />
            <FormInput
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              help="Emoji icon (e.g., '📡')"
            />
            {commonFields}
          </>
        );

      case "journey":
        return (
          <>
            <FormInput
              label="Step Number"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              help="01, 02, 03, 04"
            />
            <FormInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              help="Step title"
            />
            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                help="Step description"
              />
            </div>
            <FormInput
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              help="Material icon name"
            />
            <FormInput
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              help="Color classes (e.g., 'text-teal-600 bg-teal-50')"
            />
            {commonFields}
          </>
        );

      case "product-uses":
        return (
          <>
            <FormInput
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              help="Material icon name"
            />
            <FormInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              help="Section title"
            />
            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                help="Description of the use case"
              />
            </div>
            <FormInput
              label="Feature Tags"
              name="feature"
              value={formData.feature}
              onChange={handleInputChange}
              help="Tags like 'Lights · climate · routines'"
            />
            {commonFields}
          </>
        );

      case "projects":
        return (
          <>
            <FormInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              help="Project name"
            />
            <FormInput
              label="Tag"
              name="tag"
              value={formData.tag}
              onChange={handleInputChange}
              help="e.g., 'Beginner · 35 min'"
            />
            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                help="Project description"
              />
            </div>
            <FormInput
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              help="Material icon name"
            />
            <FormInput
              label="Tone"
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              help="Color classes (e.g., 'bg-teal-50 text-teal-700')"
            />
            {commonFields}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">
              {config?.label}
            </h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">
              {items.length}
            </span>
          </div>
          <p className="text-sm text-gray-500">{config?.description}</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {loading && (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-gray-500">Loading items...</p>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
            <Layers size={36} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-bold text-gray-600">No items here yet</h3>
            <p className="text-sm text-gray-400">
              Click "Add New" to create your first item
            </p>
          </div>
        )}

        {!loading &&
          items.map((item) => {
            const image = getItemImage(item);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                  {/* Image */}
                  {config?.image && (
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {image ? (
                        <img
                          src={image}
                          alt={item.title || "Item"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">
                        {item.title || item.label || item.value || "Untitled"}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.is_active !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.is_active !== false ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-gray-400">
                        Order: {item.display_order ?? 0}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {item.description ||
                        item.eyebrow ||
                        item.tag ||
                        item.eyebrow ||
                        ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        item.is_active !== false
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {item.is_active !== false ? "Active" : "Inactive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100 transition"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                <div>
                  <h2 className="text-xl font-black">
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </h2>
                  <p className="text-sm text-gray-500">{config?.label}</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1.5 hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {renderFields()}

                  {/* Image Upload */}
                  {config?.image && (
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        Image
                      </label>
                      <ImagePreview
                        image={
                          selectedImage ||
                          formData.image_display ||
                          formData.image ||
                          formData.image_url
                        }
                        onRemove={() => {
                          setSelectedImage(null);
                          setFormData((prev) => ({
                            ...prev,
                            image: null,
                            image_display: null,
                            image_url: "",
                          }));
                        }}
                      />
                      <div className="mt-2 flex flex-col sm:flex-row gap-3">
                        <label className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-2.5 font-semibold text-indigo-600 transition hover:bg-indigo-100">
                          <Upload size={18} />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">
                            Or use image URL
                          </p>
                          <FormInput
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingItem ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================================
// MAIN ADMIN HOME
// ==========================================================

export default function AdminHome() {
  const {
    homeConfig,
    loading,
    saving,
    error,
    fetchHomeConfig,
    updateHomeConfig,
    updateHomeConfigPartial,
  } = useAdminHome();

  const [activeSection, setActiveSection] = useState("hero");
  const [activeManager, setActiveManager] = useState("banners");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (homeConfig) setFormData(homeConfig);
  }, [homeConfig]);

  const currentSection = useMemo(
    () => SECTIONS.find((s) => s.id === activeSection),
    [activeSection],
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        products_count: Number(formData.products_count) || 4,
      };
      const updated = await updateHomeConfig(payload);
      setFormData(updated);
      toast.success("Home page updated successfully! 🎉");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSectionToggle = async (field) => {
    const oldValue = formData[field] !== false;
    const newValue = !oldValue;

    setFormData((prev) => ({ ...prev, [field]: newValue }));

    try {
      const updated = await updateHomeConfigPartial({ [field]: newValue });
      setFormData((prev) => ({ ...prev, ...updated }));
      toast.success(newValue ? "Section enabled ✅" : "Section disabled ⛔");
    } catch (error) {
      setFormData((prev) => ({ ...prev, [field]: oldValue }));
      toast.error(getErrorMessage(error));
    }
  };

  const handleGlobalToggle = async () => {
    const oldValue = formData.is_active !== false;
    const newValue = !oldValue;

    setFormData((prev) => ({ ...prev, is_active: newValue }));

    try {
      const updated = await updateHomeConfigPartial({ is_active: newValue });
      setFormData((prev) => ({ ...prev, ...updated }));
      toast.success(
        newValue ? "Home page activated ✅" : "Home page deactivated ⛔",
      );
    } catch (error) {
      setFormData((prev) => ({ ...prev, is_active: oldValue }));
      toast.error(getErrorMessage(error));
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchHomeConfig();
      toast.success("Configuration refreshed ✅");
    } catch {
      toast.error("Failed to refresh configuration");
    }
  };

  if (loading && !homeConfig) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 font-medium text-gray-500">
            Loading home configuration...
          </p>
        </div>
      </div>
    );
  }

  if (error && !homeConfig) {
    return (
      <div className="py-12 text-center">
        <p className="font-medium text-red-500">{error}</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-gray-900">
            <Settings size={30} className="text-indigo-600" />
            Home Page Management
          </h1>
          <p className="text-sm text-gray-500">
            Control what appears on your home page
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-bold text-white shadow-sm hover:shadow-md transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const enabled = formData[section.enabledField] !== false;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeSection === section.id
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {section.label}
              {!enabled && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  OFF
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section Status */}
      {currentSection && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Power size={16} className="text-indigo-600" />
              <h3 className="font-bold">{currentSection.label}</h3>
              <span className="text-sm text-gray-400">
                — {currentSection.description}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Toggle to show/hide this section on the home page
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-bold ${formData[currentSection.enabledField] !== false ? "text-green-600" : "text-red-500"}`}
            >
              {formData[currentSection.enabledField] !== false
                ? "🟢 Enabled"
                : "🔴 Disabled"}
            </span>
            <SectionToggle
              checked={formData[currentSection.enabledField] !== false}
              disabled={saving}
              onChange={() => handleSectionToggle(currentSection.enabledField)}
            />
          </div>
        </div>
      )}

      {/* Section Form */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        {activeSection === "hero" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Hero Section Settings
              </h2>
              <p className="text-sm text-gray-500">
                Main headline, subtitle, and call-to-action buttons
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Hero Title"
                name="hero_title"
                value={formData.hero_title}
                onChange={handleInputChange}
                help="Main headline (supports HTML for line breaks)"
              />
              <FormInput
                label="Badge Text"
                name="hero_badge_text"
                value={formData.hero_badge_text}
                onChange={handleInputChange}
                help="Small badge above the title (e.g., 'Vigyantra Discovery Lab')"
              />
              <div className="md:col-span-2">
                <FormTextarea
                  label="Hero Subtitle"
                  name="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={handleInputChange}
                  rows={3}
                  help="Main description below the title"
                />
              </div>
              <FormInput
                label="Primary CTA Text"
                name="cta_primary_text"
                value={formData.cta_primary_text}
                onChange={handleInputChange}
                help="Main button text (e.g., 'Start Learning')"
              />
              <FormInput
                label="Primary CTA Link"
                name="cta_primary_link"
                value={formData.cta_primary_link}
                onChange={handleInputChange}
                help="Where primary button goes (e.g., '#learn')"
              />
              <FormInput
                label="Secondary CTA Text"
                name="cta_secondary_text"
                value={formData.cta_secondary_text}
                onChange={handleInputChange}
                help="Second button text (e.g., 'Explore Projects')"
              />
              <FormInput
                label="Secondary CTA Link"
                name="cta_secondary_link"
                value={formData.cta_secondary_link}
                onChange={handleInputChange}
                help="Where second button goes (e.g., '#projects')"
              />
              <FormInput
                label="Tertiary CTA Text"
                name="cta_tertiary_text"
                value={formData.cta_tertiary_text}
                onChange={handleInputChange}
                help="Third button text (e.g., 'Shop IoT Devices')"
              />
              <FormInput
                label="Tertiary CTA Link"
                name="cta_tertiary_link"
                value={formData.cta_tertiary_link}
                onChange={handleInputChange}
                help="Where third button goes (e.g., '/shop')"
              />
            </div>
          </div>
        )}

        {activeSection === "adventures" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Adventures Section Settings
              </h2>
              <p className="text-sm text-gray-500">
                The "Learn, Build, Shop" cards section
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Section Title"
                name="adventures_title"
                value={formData.adventures_title}
                onChange={handleInputChange}
                help="Main heading for the section"
              />
              <FormInput
                label="Section Subtitle"
                name="adventures_subtitle"
                value={formData.adventures_subtitle}
                onChange={handleInputChange}
                help="Small text above the title"
              />
            </div>
          </div>
        )}

        {activeSection === "journey" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Learning Journey Settings
              </h2>
              <p className="text-sm text-gray-500">
                The 4-step learning path section
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Section Title"
                name="journey_title"
                value={formData.journey_title}
                onChange={handleInputChange}
                help="Main heading for the section"
              />
              <FormInput
                label="Section Subtitle"
                name="journey_subtitle"
                value={formData.journey_subtitle}
                onChange={handleInputChange}
                help="Small text above the title"
              />
              <div className="md:col-span-2">
                <FormTextarea
                  label="Section Description"
                  name="journey_description"
                  value={formData.journey_description}
                  onChange={handleInputChange}
                  rows={3}
                  help="Description text below the title"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === "products" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Products Section Settings
              </h2>
              <p className="text-sm text-gray-500">
                Showcase featured products from your store
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Section Title"
                name="products_title"
                value={formData.products_title}
                onChange={handleInputChange}
                help="Main heading for the section"
              />
              <FormInput
                label="Section Subtitle"
                name="products_subtitle"
                value={formData.products_subtitle}
                onChange={handleInputChange}
                help="Small text above the title"
              />
              <div className="md:col-span-2">
                <FormTextarea
                  label="Section Description"
                  name="products_description"
                  value={formData.products_description}
                  onChange={handleInputChange}
                  rows={2}
                  help="Description text below the title"
                />
              </div>
              <FormInput
                label="CTA Text"
                name="products_cta_text"
                value={formData.products_cta_text}
                onChange={handleInputChange}
                help="Button text (e.g., 'Explore the shop')"
              />
              <FormInput
                label="CTA Link"
                name="products_cta_link"
                value={formData.products_cta_link}
                onChange={handleInputChange}
                help="Where the button goes (e.g., '/shop')"
              />
              <FormInput
                label="Products to Show"
                name="products_count"
                type="number"
                min="1"
                max="12"
                value={formData.products_count}
                onChange={handleInputChange}
                help="Number of products to display (1-12)"
              />
            </div>
          </div>
        )}

        {activeSection === "projects" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Projects Section Settings
              </h2>
              <p className="text-sm text-gray-500">
                IoT project cards for beginners
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Section Title"
                name="projects_title"
                value={formData.projects_title}
                onChange={handleInputChange}
                help="Main heading for the section"
              />
              <FormInput
                label="Section Subtitle"
                name="projects_subtitle"
                value={formData.projects_subtitle}
                onChange={handleInputChange}
                help="Small text above the title"
              />
              <FormInput
                label="CTA Text"
                name="projects_cta_text"
                value={formData.projects_cta_text}
                onChange={handleInputChange}
                help="Link text (e.g., 'See all projects →')"
              />
              <FormInput
                label="CTA Link"
                name="projects_cta_link"
                value={formData.projects_cta_link}
                onChange={handleInputChange}
                help="Where the link goes (e.g., '#learn')"
              />
            </div>
          </div>
        )}

        {activeSection === "contact" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Contact Section Settings
              </h2>
              <p className="text-sm text-gray-500">
                Call-to-action for contact/sales
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormInput
                  label="Section Title"
                  name="contact_title"
                  value={formData.contact_title}
                  onChange={handleInputChange}
                  help="Main heading (e.g., 'Ready to Go Smart?')"
                />
              </div>
              <div className="md:col-span-2">
                <FormTextarea
                  label="Section Subtitle"
                  name="contact_subtitle"
                  value={formData.contact_subtitle}
                  onChange={handleInputChange}
                  rows={2}
                  help="Description text below the title"
                />
              </div>
              <FormInput
                label="Primary CTA Text"
                name="contact_cta_text"
                value={formData.contact_cta_text}
                onChange={handleInputChange}
                help="Main button text (e.g., 'Start Shopping')"
              />
              <FormInput
                label="Primary CTA Link"
                name="contact_cta_link"
                value={formData.contact_cta_link}
                onChange={handleInputChange}
                help="Where main button goes (e.g., '/shop')"
              />
              <FormInput
                label="Secondary CTA Text"
                name="contact_cta_secondary_text"
                value={formData.contact_cta_secondary_text}
                onChange={handleInputChange}
                help="Second button text (e.g., 'Contact Sales')"
              />
              <FormInput
                label="Secondary CTA Link"
                name="contact_cta_secondary_link"
                value={formData.contact_cta_secondary_link}
                onChange={handleInputChange}
                help="Where second button goes (e.g., '/contact')"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Content Manager */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900">Content Manager</h2>
          <p className="text-sm text-gray-500">
            Add, edit, and manage all dynamic content items
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 pb-3">
          {ITEM_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveManager(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  activeManager === item.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        <HomeItemsManager
          key={activeManager}
          itemType={activeManager}
          refreshHome={fetchHomeConfig}
        />
      </div>

      {/* Global Status */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-black text-gray-900">Home Page Status</h3>
          <p className="text-sm text-gray-500">
            {formData.is_active !== false
              ? "🟢 Your home page is visible to everyone"
              : "🔴 Your home page is hidden (shows under construction)"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`font-bold ${formData.is_active !== false ? "text-green-600" : "text-red-500"}`}
          >
            {formData.is_active !== false ? "🟢 Active" : "🔴 Inactive"}
          </span>
          <SectionToggle
            checked={formData.is_active !== false}
            disabled={saving}
            onChange={handleGlobalToggle}
          />
        </div>
      </div>
    </div>
  );
}
