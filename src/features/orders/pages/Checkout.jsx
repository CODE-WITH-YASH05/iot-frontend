import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import useCart from "../../cart/hooks/useCart";
import { useAddress } from "../../address/hooks/useAddress";
import { useProduct } from "../../products/hooks/useProduct";
import orderApi from "../api/orderApi";

// ==========================================================
// CHECKOUT PRODUCT IMAGE COMPONENT
// ==========================================================

const CheckoutProductImage = ({ slug, productName, className = "" }) => {
  const { product, isLoading, isError } = useProduct(slug);

  const getProductImage = () => {
    if (!product) return null;

    // Direct image fields
    if (product.product_image) return product.product_image;
    if (product.primary_image) return product.primary_image;
    if (product.image_url) return product.image_url;
    if (product.thumbnail) return product.thumbnail;

    // Images array
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string") return firstImage;
      return (
        firstImage?.image || firstImage?.image_url || firstImage?.url || null
      );
    }

    return null;
  };

  const image = getProductImage();

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 ${className}`}
      >
        <div className="w-5 h-5 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !image) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 ${className}`}
      >
        <span className="text-xl">📦</span>
      </div>
    );
  }

  return (
    <img
      src={
        image.startsWith("http")
          ? image
          : `${import.meta.env.VITE_API_BASE_URL}${image}`
      }
      alt={productName || "Product"}
      className={className}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = "none";
        e.target.parentElement.innerHTML =
          '<span className="text-xl">📦</span>';
      }}
    />
  );
};

// ==========================================================
// CHECKOUT PAGE - COMPLETE WORKING VERSION
// ==========================================================

export default function Checkout() {
  // ========================================================
  // HOOKS
  // ========================================================

  const {
    items: cart,
    cartTotal,
    loading: cartLoading,
    error: cartError,
  } = useCart();

  const {
    addresses,
    defaultAddress,
    loading: addressLoading,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddress();

  const navigate = useNavigate();

  // ========================================================
  // STATE
  // ========================================================

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [orderError, setOrderError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });

  // ========================================================
  // EFFECTS
  // ========================================================

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await getAddresses();
      } catch (error) {
        console.error("Failed to load addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.id);
      populateFormFromAddress(defaultAddress);
    }
  }, [defaultAddress]);

  // ========================================================
  // HELPER FUNCTIONS
  // ========================================================

  const populateFormFromAddress = (address) => {
    setFormData({
      full_name: address.full_name || "",
      phone: address.phone || "",
      email: address.email || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "India",
      is_default: address.is_default || false,
    });
  };

  const resetAddressForm = () => {
    setFormData({
      full_name: "",
      phone: "",
      email: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false,
    });
    setAddressError("");
  };

  // ========================================================
  // ADDRESS HANDLERS
  // ========================================================

  const handleAddressSelect = (addressId) => {
    const address = addresses.find((a) => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      populateFormFromAddress(address);
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressError("");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingAddress(true);
    setAddressError("");

    // Validation
    const requiredFields = {
      full_name: "Full name is required",
      phone: "Phone number is required",
      address_line_1: "Address is required",
      city: "City is required",
      state: "State is required",
      postal_code: "Postal code is required",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field]?.trim()) {
        setAddressError(message);
        setIsSubmittingAddress(false);
        return;
      }
    }

    try {
      const addressData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address_line_1: formData.address_line_1.trim(),
        address_line_2: formData.address_line_2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        country: formData.country,
        is_default: formData.is_default,
      };

      if (editingAddressId) {
        await updateAddress(editingAddressId, addressData);
        toast.success("Address updated successfully!");
      } else {
        await addAddress(addressData);
        toast.success("Address added successfully!");
      }

      const updatedAddresses = await getAddresses();
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();

      if (updatedAddresses && updatedAddresses.length > 0) {
        const latestAddress = updatedAddresses[0];
        setSelectedAddressId(latestAddress.id);
        populateFormFromAddress(latestAddress);
      }
    } catch (err) {
      setAddressError(err?.message || "Failed to save address");
      toast.error("Failed to save address");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    populateFormFromAddress(address);
    setShowAddressForm(true);
    setSelectedAddressId(null);
    setAddressError("");
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      await deleteAddress(addressId);
      const updatedAddresses = await getAddresses();
      toast.success("Address deleted successfully!");

      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        const defaultAddr = updatedAddresses?.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          populateFormFromAddress(defaultAddr);
        }
      }
    } catch (err) {
      toast.error("Failed to delete address");
      console.error("Failed to delete address:", err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      const updatedAddresses = await getAddresses();
      toast.success("Default address updated!");

      const address = updatedAddresses?.find((a) => a.id === addressId);
      if (address) {
        setSelectedAddressId(addressId);
        populateFormFromAddress(address);
      }
    } catch (err) {
      toast.error("Failed to set default address");
      console.error("Failed to set default:", err);
    }
  };

  // ========================================================
  // PLACE ORDER
  // ========================================================

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");

    // Validate address
    if (!selectedAddressId) {
      setAddressError("Please select a shipping address.");
      setCurrentStep(1);
      toast.error("Please select a shipping address");
      return;
    }

    // Validate cart
    if (cart.length === 0) {
      setOrderError("Your cart is empty.");
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const response = await orderApi.checkout(selectedAddressId);
      const orderData = response?.data?.data || response?.data;

      if (!orderData || !orderData.id) {
        throw new Error("Invalid order response");
      }

      toast.success("Order placed successfully! 🎉");

      navigate("/order-success", {
        state: { order: orderData },
        replace: true,
      });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.address?.[0] ||
        err?.message ||
        "Unable to place order. Please try again.";

      setOrderError(errorMessage);
      toast.error(errorMessage);
      setCurrentStep(3);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ========================================================
  // LOADING STATES
  // ========================================================

  if (cartLoading || isLoading || addressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">
              Loading checkout...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ========================================================
  // ERROR STATES
  // ========================================================

  if (cartError && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-red-400">
                error
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to Load Checkout
            </h2>
            <p className="text-gray-500 mb-6">{cartError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ========================================================
  // EMPTY CART
  // ========================================================

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-6xl text-gray-300">
                shopping_bag
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some products to your cart before checking out.
            </p>
            <Link
              to="/shop"
              className="inline-flex px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              Browse Products
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ========================================================
  // PRICE CALCULATION
  // ========================================================

  const discount = 0;
  const shipping = 0;
  const finalTotal = cartTotal;

  // ========================================================
  // STEP CONFIGURATION
  // ========================================================

  const steps = [
    { number: 1, title: "Shipping", icon: "local_shipping" },
    { number: 2, title: "Payment", icon: "payments" },
    { number: 3, title: "Review", icon: "receipt_long" },
  ];

  const paymentMethods = [
    {
      id: "cod",
      icon: "payments",
      label: "Cash on Delivery",
      desc: "Pay when you receive",
    },
    {
      id: "upi",
      icon: "qr_code_scanner",
      label: "UPI",
      desc: "Google Pay, PhonePe, Paytm",
    },
    {
      id: "card",
      icon: "credit_card",
      label: "Card",
      desc: "Credit / Debit Card",
    },
    {
      id: "netbanking",
      icon: "account_balance",
      label: "Net Banking",
      desc: "All major banks",
    },
  ];

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      <main className="flex-grow pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-center gap-2 md:gap-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <button
                    type="button"
                    onClick={() =>
                      currentStep >= step.number && setCurrentStep(step.number)
                    }
                    className={`flex items-center gap-2 md:gap-3 transition-all ${
                      currentStep >= step.number
                        ? "text-indigo-600"
                        : "text-gray-400"
                    }`}
                    disabled={currentStep < step.number}
                  >
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all ${
                        currentStep > step.number
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                          : currentStep === step.number
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <span className="material-symbols-outlined text-xl">
                          check
                        </span>
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Step {step.number}
                      </p>
                      <p className="text-sm font-bold">{step.title}</p>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-0.5 rounded-full ${
                        currentStep > step.number
                          ? "bg-green-400"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Order Error */}
          {orderError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-red-500 mt-0.5">
                error_outline
              </span>
              <div className="flex-1">
                <p className="font-semibold">Order Failed</p>
                <p className="text-sm">{orderError}</p>
              </div>
              <button
                onClick={() => setOrderError("")}
                className="text-red-400 hover:text-red-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="wait">
                {/* STEP 1: SHIPPING */}
                {currentStep === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">
                                local_shipping
                              </span>
                            </span>
                            Shipping Address
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {addresses.length > 0
                              ? `${addresses.length} address${addresses.length > 1 ? "es" : ""} saved`
                              : "Add your shipping address"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(!showAddressForm);
                            if (!showAddressForm) {
                              setEditingAddressId(null);
                              resetAddressForm();
                              setFormData((prev) => ({
                                ...prev,
                                is_default: addresses.length === 0,
                              }));
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">
                            {showAddressForm ? "close" : "add"}
                          </span>
                          {showAddressForm ? "Cancel" : "Add New"}
                        </button>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      {addressError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">
                            error
                          </span>
                          {addressError}
                        </div>
                      )}

                      {/* Address Form */}
                      {showAddressForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-200"
                        >
                          <h4 className="font-bold text-gray-900 mb-4">
                            {editingAddressId
                              ? "Edit Address"
                              : "Add New Address"}
                          </h4>
                          <form
                            onSubmit={handleAddressSubmit}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Full Name *
                                </label>
                                <input
                                  type="text"
                                  value={formData.full_name}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      full_name: e.target.value,
                                    })
                                  }
                                  placeholder="John Doe"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Phone *
                                </label>
                                <input
                                  type="tel"
                                  value={formData.phone}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      phone: e.target.value,
                                    })
                                  }
                                  placeholder="+91 98765 43210"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      email: e.target.value,
                                    })
                                  }
                                  placeholder="john@example.com"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Address Line 1 *
                                </label>
                                <input
                                  type="text"
                                  value={formData.address_line_1}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      address_line_1: e.target.value,
                                    })
                                  }
                                  placeholder="123 Main Street"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                  required
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Address Line 2
                                </label>
                                <input
                                  type="text"
                                  value={formData.address_line_2}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      address_line_2: e.target.value,
                                    })
                                  }
                                  placeholder="Apartment, Suite, Building"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  City *
                                </label>
                                <input
                                  type="text"
                                  value={formData.city}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      city: e.target.value,
                                    })
                                  }
                                  placeholder="Mumbai"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  State *
                                </label>
                                <input
                                  type="text"
                                  value={formData.state}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      state: e.target.value,
                                    })
                                  }
                                  placeholder="Maharashtra"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  PIN Code *
                                </label>
                                <input
                                  type="text"
                                  value={formData.postal_code}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      postal_code: e.target.value,
                                    })
                                  }
                                  placeholder="400001"
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                  Country
                                </label>
                                <select
                                  value={formData.country}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      country: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                                >
                                  <option value="India">India</option>
                                  <option value="United States">
                                    United States
                                  </option>
                                  <option value="United Kingdom">
                                    United Kingdom
                                  </option>
                                  <option value="Canada">Canada</option>
                                  <option value="Australia">Australia</option>
                                  <option value="Germany">Germany</option>
                                  <option value="France">France</option>
                                  <option value="Japan">Japan</option>
                                  <option value="Singapore">Singapore</option>
                                  <option value="UAE">UAE</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.is_default}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        is_default: e.target.checked,
                                      })
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Set as default address
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddressForm(false);
                                  setEditingAddressId(null);
                                  setAddressError("");
                                  resetAddressForm();
                                }}
                                className="px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmittingAddress}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                {isSubmittingAddress ? (
                                  <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-base">
                                      {editingAddressId ? "save" : "add"}
                                    </span>
                                    {editingAddressId ? "Update" : "Save"}
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}

                      {/* Saved Addresses */}
                      {addresses.length > 0 && !showAddressForm && (
                        <div className="mb-6">
                          <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 block">
                            Select Shipping Address
                          </label>
                          <div className="space-y-3">
                            {addresses.map((address) => (
                              <motion.div
                                key={address.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                  selectedAddressId === address.id
                                    ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => handleAddressSelect(address.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-gray-900">
                                        {address.full_name}
                                      </p>
                                      {address.is_default && (
                                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                                          Default
                                        </span>
                                      )}
                                      {selectedAddressId === address.id && (
                                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                          Selected
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {address.address_line_1}
                                    </p>
                                    {address.address_line_2 && (
                                      <p className="text-sm text-gray-600">
                                        {address.address_line_2}
                                      </p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                      {address.city}, {address.state}{" "}
                                      {address.postal_code}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {address.phone}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 ml-4">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditAddress(address);
                                      }}
                                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                                      title="Edit address"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        edit
                                      </span>
                                    </button>
                                    {!address.is_default && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSetDefault(address.id);
                                        }}
                                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-all"
                                        title="Set as default"
                                      >
                                        <span className="material-symbols-outlined text-sm">
                                          star
                                        </span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAddress(address.id);
                                      }}
                                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                      title="Delete address"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        delete
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (!selectedAddressId) {
                              setAddressError(
                                "Please select or add a shipping address",
                              );
                              toast.error("Please select a shipping address");
                              return;
                            }
                            setAddressError("");
                            setOrderError("");
                            setCurrentStep(2);
                          }}
                          className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                        >
                          Continue to Payment
                          <span className="material-symbols-outlined text-lg">
                            arrow_forward
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PAYMENT */}
                {currentStep === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">
                            payments
                          </span>
                        </span>
                        Payment Method
                      </h2>
                      <p className="text-sm text-gray-500 mt-2">
                        Choose your preferred payment method
                      </p>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paymentMethods.map((method) => (
                          <motion.label
                            key={method.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === method.id}
                              onChange={() => setPaymentMethod(method.id)}
                              className="sr-only peer"
                            />
                            <div
                              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                                paymentMethod === method.id
                                  ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              }`}
                            >
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  paymentMethod === method.id
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                <span className="material-symbols-outlined text-2xl">
                                  {method.icon}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-bold ${
                                    paymentMethod === method.id
                                      ? "text-indigo-600"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {method.label}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {method.desc}
                                </p>
                              </div>
                              {paymentMethod === method.id && (
                                <span className="material-symbols-outlined text-indigo-600 text-xl">
                                  check_circle
                                </span>
                              )}
                            </div>
                          </motion.label>
                        ))}
                      </div>

                      {/* Payment Details */}
                      {paymentMethod === "upi" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200"
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            Enter UPI ID
                          </p>
                          <input
                            type="text"
                            placeholder="yourname@upi"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                          />
                        </motion.div>
                      )}

                      {paymentMethod === "card" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3"
                        >
                          <input
                            type="text"
                            placeholder="Card Number"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                            />
                            <input
                              type="text"
                              placeholder="CVV"
                              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                            />
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(1);
                            setOrderError("");
                          }}
                          className="text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-lg">
                            arrow_back
                          </span>
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setOrderError("");
                            setCurrentStep(3);
                          }}
                          className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg transition-all flex items-center gap-2"
                        >
                          Review Order
                          <span className="material-symbols-outlined text-lg">
                            arrow_forward
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: REVIEW */}
                {currentStep === 3 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">
                            receipt_long
                          </span>
                        </span>
                        Review Your Order
                      </h2>
                      <p className="text-sm text-gray-500 mt-2">
                        Please verify all details before placing order
                      </p>
                    </div>

                    <div className="p-6 md:p-8 space-y-5">
                      {/* Shipping Review */}
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-indigo-600 text-lg">
                            local_shipping
                          </span>
                          Shipping To
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formData.full_name}
                          <br />
                          {formData.address_line_1}
                          {formData.address_line_2 && (
                            <>
                              <br />
                              {formData.address_line_2}
                            </>
                          )}
                          <br />
                          {formData.city}, {formData.state} -{" "}
                          {formData.postal_code}
                          <br />
                          {formData.phone}{" "}
                          {formData.email && `• ${formData.email}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(1);
                            setOrderError("");
                          }}
                          className="text-xs text-indigo-600 hover:underline mt-2 font-medium"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Payment Review */}
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-indigo-600 text-lg">
                            payments
                          </span>
                          Payment Method
                        </h4>
                        <p className="text-sm text-gray-600 capitalize font-medium">
                          {paymentMethods.find((p) => p.id === paymentMethod)
                            ?.label || paymentMethod}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(2);
                            setOrderError("");
                          }}
                          className="text-xs text-indigo-600 hover:underline mt-2 font-medium"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Items Review */}
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">
                          Order Items ({cart.length})
                        </h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {cart.map((item) => {
                            const unitPrice =
                              item.product_discount_price !== null &&
                              item.product_discount_price !== undefined
                                ? Number(item.product_discount_price)
                                : Number(item.product_price);

                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3"
                              >
                                {/* PRODUCT IMAGE */}
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  <CheckoutProductImage
                                    slug={item.product_slug}
                                    productName={item.product_name}
                                    className="w-9 h-9 object-contain"
                                  />
                                </div>

                                {/* PRODUCT INFO */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Qty: {item.quantity} × ₹
                                    {unitPrice.toLocaleString("en-IN")}
                                  </p>
                                </div>

                                {/* TOTAL */}
                                <span className="text-sm font-bold text-gray-900">
                                  ₹
                                  {Number(item.line_total || 0).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(2);
                            setOrderError("");
                          }}
                          className="text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-lg">
                            arrow_back
                          </span>
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={isPlacingOrder}
                          onClick={handlePlaceOrder}
                          className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-base shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPlacingOrder ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Placing Order...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined">
                                lock
                              </span>
                              Place Order • ₹
                              {finalTotal.toLocaleString("en-IN")}
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg sticky top-28"
              >
                <div className="p-5 md:p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">
                      shopping_bag
                    </span>
                    Order Summary
                  </h3>
                </div>

                <div className="p-5 md:p-6 space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => {
                    const unitPrice =
                      item.product_discount_price !== null &&
                      item.product_discount_price !== undefined
                        ? Number(item.product_discount_price)
                        : Number(item.product_price);

                    return (
                      <div key={item.id} className="flex gap-3 group">
                        {/* IMAGE */}
                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                          <CheckoutProductImage
                            slug={item.product_slug}
                            productName={item.product_name}
                            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                          />
                        </div>

                        {/* INFO */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Qty: {item.quantity} × ₹
                            {unitPrice.toLocaleString("en-IN")}
                          </p>
                        </div>

                        {/* TOTAL */}
                        <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                          ₹
                          {Number(item.line_total || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 font-semibold">
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600 font-semibold">-₹0</span>
                  </div>
                </div>

                <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="px-5 md:px-6 pb-5 md:pb-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-2">
                    <span>🔒 256-bit SSL</span>
                    <span>•</span>
                    <span>✓ Secure</span>
                  </div>
                  <div className="flex justify-center gap-3 text-xl">
                    {["💳", "📱", "🏦", "💰"].map((icon, i) => (
                      <span key={i} className="opacity-50">
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
