import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  LocateFixed,
  Settings,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

import useAdminContact from "../hooks/useAdminContact";

const defaultSettings = {
  company_name: "",
  support_phone: "",
  whatsapp_number: "",
  support_email: "",
  sales_email: "",
  working_days: "",
  working_hours: "",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  linkedin_url: "",
  twitter_url: "",
  contact_form_enabled: true,
};

const emptyOffice = {
  name: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  phone: "",
  alternate_phone: "",
  email: "",
  working_days: "",
  working_hours: "",
  google_maps_url: "",
  latitude: "",
  longitude: "",
  image: null,
  is_active: true,
  display_order: 0,
};

const emptyFAQ = {
  question: "",
  answer: "",
  is_active: true,
  display_order: 0,
};

export default function AdminContact() {
  const {
    settings,
    offices,
    faqs,
    inquiries,
    loading,
    saving,
    error,
    updateSettings,
    createOffice,
    updateOffice,
    deleteOffice,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    updateInquiry,
    deleteInquiry,
  } = useAdminContact();

  const [activeTab, setActiveTab] = useState("settings");
  const [settingsForm, setSettingsForm] = useState(defaultSettings);
  const [officeForm, setOfficeForm] = useState(emptyOffice);
  const [editingOffice, setEditingOffice] = useState(null);
  const [faqForm, setFaqForm] = useState(emptyFAQ);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [inquiryStatus, setInquiryStatus] = useState("new");
  const [inquiryPriority, setInquiryPriority] = useState("normal");
  const [adminReply, setAdminReply] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Settings sync
  useEffect(() => {
    if (settings) {
      setSettingsForm({ ...defaultSettings, ...settings });
    }
  }, [settings]);

  // =====================================================
  // LOCATION DETECTION
  // =====================================================

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setOfficeForm((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          google_maps_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        }));

        toast.success("Location detected successfully! 🎯");
        setIsLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        toast.error(
          "Unable to get your location. Please allow location permission.",
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // =====================================================
  // SETTINGS
  // =====================================================

  const handleSettingsChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettingsForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateSettings(settingsForm);
      toast.success("Contact settings updated successfully! 🎉");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update settings.");
    }
  };

  // =====================================================
  // OFFICE CRUD
  // =====================================================

  const handleOfficeChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    setOfficeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleOfficeSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(officeForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      if (editingOffice) {
        await updateOffice(editingOffice, formData);
        toast.success("Office updated successfully! 🎉");
      } else {
        await createOffice(formData);
        toast.success("Office created successfully! 🎉");
      }

      setOfficeForm(emptyOffice);
      setEditingOffice(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save office.");
    }
  };

  const handleEditOffice = (office) => {
    setEditingOffice(office.id);
    setOfficeForm({ ...emptyOffice, ...office, image: null });
    setActiveTab("offices");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteOffice = async (id) => {
    if (!window.confirm("Delete this office?")) return;
    try {
      await deleteOffice(id);
      toast.success("Office deleted successfully! 🗑️");
    } catch (err) {
      toast.error("Failed to delete office.");
    }
  };

  // =====================================================
  // FAQ CRUD
  // =====================================================

  const handleFAQChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFaqForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFAQSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ, faqForm);
        toast.success("FAQ updated successfully! 🎉");
      } else {
        await createFAQ(faqForm);
        toast.success("FAQ created successfully! 🎉");
      }
      setFaqForm(emptyFAQ);
      setEditingFAQ(null);
    } catch (err) {
      toast.error("Failed to save FAQ.");
    }
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq.id);
    setFaqForm({
      question: faq.question || "",
      answer: faq.answer || "",
      is_active: faq.is_active ?? true,
      display_order: faq.display_order ?? 0,
    });
  };

  const handleDeleteFAQ = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await deleteFAQ(id);
      toast.success("FAQ deleted successfully! 🗑️");
    } catch (err) {
      toast.error("Failed to delete FAQ.");
    }
  };

  // =====================================================
  // INQUIRY
  // =====================================================

  const handleEditInquiry = (inquiry) => {
    setEditingInquiry(inquiry);
    setInquiryStatus(inquiry.status || "new");
    setInquiryPriority(inquiry.priority || "normal");
    setAdminReply(inquiry.admin_reply || "");
  };

  const handleSaveInquiry = async () => {
    if (!editingInquiry) return;
    try {
      await updateInquiry(editingInquiry.id, {
        status: inquiryStatus,
        priority: inquiryPriority,
        admin_reply: adminReply,
      });
      setEditingInquiry(null);
      toast.success("Inquiry updated successfully! 🎉");
    } catch (err) {
      toast.error("Failed to update inquiry.");
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await deleteInquiry(id);
      toast.success("Inquiry deleted successfully! 🗑️");
    } catch (err) {
      toast.error("Failed to delete inquiry.");
    }
  };

  // =====================================================
  // TABS
  // =====================================================

  const tabs = [
    { key: "settings", label: "Settings", icon: Settings },
    { key: "offices", label: "Offices", icon: Building2 },
    { key: "faqs", label: "FAQs", icon: HelpCircle },
    { key: "inquiries", label: "Inquiries", icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">
            Loading contact management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Building2 className="text-indigo-600" size={28} />
          Contact Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage contact details, offices, FAQs and customer enquiries.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 mb-8 pb-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 whitespace-nowrap font-medium border-b-2 transition-all ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* =====================================================
          SETTINGS
      ===================================================== */}
      {activeTab === "settings" && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSettingsSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900">Contact Settings</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              ["company_name", "Company Name"],
              ["support_phone", "Support Phone"],
              ["whatsapp_number", "WhatsApp Number"],
              ["support_email", "Support Email"],
              ["sales_email", "Sales Email"],
              ["working_days", "Working Days"],
              ["working_hours", "Working Hours"],
              ["facebook_url", "Facebook URL"],
              ["instagram_url", "Instagram URL"],
              ["youtube_url", "YouTube URL"],
              ["linkedin_url", "LinkedIn URL"],
              ["twitter_url", "Twitter/X URL"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  type="text"
                  name={name}
                  value={settingsForm[name] || ""}
                  onChange={handleSettingsChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="contact_form_enabled"
              checked={settingsForm.contact_form_enabled}
              onChange={handleSettingsChange}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Contact Form
            </span>
          </label>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </motion.form>
      )}

      {/* =====================================================
          OFFICES
      ===================================================== */}
      {activeTab === "offices" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Office Form */}
          <form
            onSubmit={handleOfficeSubmit}
            className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingOffice ? "Edit Office" : "Add Office"}
              </h2>
              {editingOffice && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingOffice(null);
                    setOfficeForm(emptyOffice);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                ["name", "Office Name"],
                ["city", "City"],
                ["state", "State"],
                ["country", "Country"],
                ["pincode", "Pincode"],
                ["phone", "Phone"],
                ["alternate_phone", "Alternate Phone"],
                ["email", "Email"],
                ["working_days", "Working Days"],
                ["working_hours", "Working Hours"],
                ["display_order", "Display Order"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={officeForm[name] ?? ""}
                    onChange={handleOfficeChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={officeForm.address}
                onChange={handleOfficeChange}
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
              />
            </div>

            {/* Location Section with "Use Current Location" */}
            <div className="md:col-span-2 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Office Location
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLocating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <LocateFixed size={16} />
                      Use Current Location
                    </>
                  )}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={officeForm.latitude || ""}
                    onChange={handleOfficeChange}
                    placeholder="Example: 21.2380"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={officeForm.longitude || ""}
                    onChange={handleOfficeChange}
                    placeholder="Example: 81.6296"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  name="google_maps_url"
                  value={officeForm.google_maps_url || ""}
                  onChange={handleOfficeChange}
                  placeholder="https://www.google.com/maps/..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Office Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleOfficeChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={officeForm.is_active}
                onChange={handleOfficeChange}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active Office
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingOffice
                  ? "Update Office"
                  : "Add Office"}
            </button>
          </form>

          {/* Office List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offices.map((office) => (
              <motion.div
                key={office.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {office.image_url && (
                  <img
                    src={office.image_url}
                    alt={office.name}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-bold text-lg text-gray-900">
                      {office.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        office.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {office.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">{office.address}</p>
                  <p className="mt-1 text-sm">
                    {office.city}
                    {office.state ? `, ${office.state}` : ""}
                  </p>
                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={() => handleEditOffice(office)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-sm font-medium"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOffice(office.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-medium"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* =====================================================
          FAQS
      ===================================================== */}
      {activeTab === "faqs" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <form
            onSubmit={handleFAQSubmit}
            className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-5 shadow-sm"
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFAQ ? "Edit FAQ" : "Add FAQ"}
              </h2>
              {editingFAQ && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFAQ(null);
                    setFaqForm(emptyFAQ);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
            <input
              type="text"
              name="question"
              value={faqForm.question}
              onChange={handleFAQChange}
              placeholder="Question"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
            <textarea
              name="answer"
              value={faqForm.answer}
              onChange={handleFAQChange}
              placeholder="Answer"
              rows={5}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
            />
            <input
              type="number"
              name="display_order"
              value={faqForm.display_order}
              onChange={handleFAQChange}
              placeholder="Display Order"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={faqForm.is_active}
                onChange={handleFAQChange}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active FAQ
              </span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : editingFAQ ? "Update FAQ" : "Add FAQ"}
            </button>
          </form>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex justify-between gap-4">
                  <h3 className="font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${faq.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {faq.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 text-gray-500">{faq.answer}</p>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => handleEditFAQ(faq)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-sm font-medium"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFAQ(faq.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-medium"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* =====================================================
          INQUIRIES
      ===================================================== */}
      {activeTab === "inquiries" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500 font-medium">
                No customer inquiries found.
              </p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {inquiry.subject || "Customer Inquiry"}
                    </h3>
                    <p className="mt-1 text-gray-500">
                      {inquiry.name} • {inquiry.email}
                    </p>
                    {inquiry.mobile && (
                      <p className="text-gray-500">{inquiry.mobile}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        inquiry.status === "resolved" ||
                        inquiry.status === "closed"
                          ? "bg-green-100 text-green-700"
                          : inquiry.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : inquiry.status === "replied"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {inquiry.status_display || inquiry.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        inquiry.priority === "urgent" ||
                        inquiry.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : inquiry.priority === "normal"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {inquiry.priority_display || inquiry.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">
                    {inquiry.inquiry_type_display || inquiry.inquiry_type}
                  </p>
                  <p className="mt-2">{inquiry.message}</p>
                  {inquiry.order_id && (
                    <p className="mt-3 text-sm">
                      Order ID: <strong>{inquiry.order_id}</strong>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => handleEditInquiry(inquiry)}
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleDeleteInquiry(inquiry.id)}
                    className="px-5 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all"
                  >
                    Delete
                  </button>
                </div>

                {/* Inquiry Edit */}
                {editingInquiry?.id === inquiry.id && (
                  <div className="mt-5 border-t pt-5 space-y-4">
                    <select
                      value={inquiryStatus}
                      onChange={(e) => setInquiryStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="replied">Replied</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={inquiryPriority}
                      onChange={(e) => setInquiryPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Admin Reply"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveInquiry}
                        disabled={saving}
                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => setEditingInquiry(null)}
                        className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
