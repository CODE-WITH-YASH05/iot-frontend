import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart, useOrders } from "../store/useStore";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [payment, setPayment] = useState("upi");
  const [saveAddress, setSaveAddress] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal: "",
  });

  const discount = Math.round(cartTotal * 0.1);
  const shipping = cartTotal > 999 ? 0 : 99;
  const finalTotal = cartTotal - discount + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-gray-300">
                shopping_bag
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              No items to checkout
            </h2>
            <p className="text-gray-500 mb-6">
              Add some products to your cart first!
            </p>
            <Link
              to="/shop"
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
            >
              Browse Products
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    addOrder({
      items: cart,
      total: finalTotal,
      discount,
      shipping,
      payment,
      shippingAddress: form,
      status: "Confirmed",
    });
    clearCart();
    navigate("/order-success");
  };

  const steps = [
    { number: 1, title: "Shipping", icon: "local_shipping" },
    { number: 2, title: "Payment", icon: "payments" },
    { number: 3, title: "Review", icon: "receipt_long" },
  ];

  const paymentMethods = [
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
      desc: "Credit / Debit / ATM",
    },
    {
      id: "netbanking",
      icon: "account_balance",
      label: "Net Banking",
      desc: "All major banks",
    },
    {
      id: "cod",
      icon: "payments",
      label: "Cash on Delivery",
      desc: "Pay when you receive",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-center gap-2 md:gap-4">
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    className={`flex items-center gap-2 md:gap-3 transition-all ${
                      currentStep >= step.number
                        ? "text-indigo-600"
                        : "text-gray-400"
                    }`}
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
                  {i < steps.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-0.5 rounded-full transition-all ${
                        currentStep > step.number
                          ? "bg-green-400"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left - Form Sections */}
            <div className="lg:col-span-8 space-y-6">
              {/* Step 1: Shipping Address */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">
                            local_shipping
                          </span>
                        </span>
                        Shipping Address
                      </h2>
                      <p className="text-sm text-gray-500 mt-2 ml-13">
                        Where should we deliver your order?
                      </p>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {[
                          {
                            label: "First Name *",
                            key: "firstName",
                            icon: "person",
                            placeholder: "John",
                          },
                          {
                            label: "Last Name *",
                            key: "lastName",
                            icon: "person",
                            placeholder: "Doe",
                          },
                          {
                            label: "Email Address *",
                            key: "email",
                            type: "email",
                            icon: "mail",
                            placeholder: "john@example.com",
                          },
                          {
                            label: "Phone Number *",
                            key: "phone",
                            type: "tel",
                            icon: "call",
                            placeholder: "+91 98765 43210",
                          },
                          {
                            label: "Street Address *",
                            key: "address",
                            icon: "home",
                            placeholder: "123, Main Street, Apartment 4B",
                            span: 2,
                          },
                          {
                            label: "City *",
                            key: "city",
                            icon: "location_city",
                            placeholder: "Mumbai",
                          },
                          {
                            label: "State *",
                            key: "state",
                            icon: "map",
                            placeholder: "Maharashtra",
                          },
                          {
                            label: "PIN Code *",
                            key: "postal",
                            icon: "pin_drop",
                            placeholder: "400001",
                          },
                        ].map((field) => (
                          <div
                            key={field.key}
                            className={`flex flex-col gap-1.5 ${field.span === 2 ? "md:col-span-2" : ""}`}
                          >
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                              {field.label}
                            </label>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                {field.icon}
                              </span>
                              <input
                                type={field.type || "text"}
                                required
                                value={form[field.key]}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    [field.key]: e.target.value,
                                  })
                                }
                                placeholder={field.placeholder}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={() => setSaveAddress(!saveAddress)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="text-sm text-gray-500">
                          Save this address for future orders
                        </label>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentStep(2)}
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

                {/* Step 2: Payment Method */}
                {currentStep === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">
                            payments
                          </span>
                        </span>
                        Payment Method
                      </h2>
                      <p className="text-sm text-gray-500 mt-2 ml-13">
                        Choose your preferred payment method
                      </p>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {paymentMethods.map((p) => (
                          <motion.label
                            key={p.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="payment"
                              checked={payment === p.id}
                              onChange={() => setPayment(p.id)}
                              className="sr-only peer"
                            />
                            <div
                              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                                payment === p.id
                                  ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                              }`}
                            >
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                  payment === p.id
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                <span className="material-symbols-outlined text-2xl">
                                  {p.icon}
                                </span>
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-bold ${payment === p.id ? "text-indigo-600" : "text-gray-700"}`}
                                >
                                  {p.label}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {p.desc}
                                </p>
                              </div>
                              {payment === p.id && (
                                <div className="ml-auto">
                                  <span className="material-symbols-outlined text-indigo-600 text-xl">
                                    check_circle
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.label>
                        ))}
                      </div>

                      {payment === "upi" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200"
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            Enter UPI ID
                          </p>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              alternate_email
                            </span>
                            <input
                              type="text"
                              placeholder="yourname@upi"
                              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none transition-all"
                            />
                          </div>
                        </motion.div>
                      )}

                      {payment === "card" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3"
                        >
                          <input
                            type="text"
                            placeholder="Card Number"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none"
                            />
                            <input
                              type="text"
                              placeholder="CVV"
                              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none"
                            />
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            arrow_back
                          </span>{" "}
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentStep(3)}
                          className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
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

                {/* Step 3: Review & Place Order */}
                {currentStep === 3 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">
                            receipt_long
                          </span>
                        </span>
                        Review Your Order
                      </h2>
                      <p className="text-sm text-gray-500 mt-2 ml-13">
                        Please verify all details before placing order
                      </p>
                    </div>

                    <div className="p-6 md:p-8 space-y-5">
                      {/* Shipping Summary */}
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-indigo-600 text-lg">
                            local_shipping
                          </span>
                          Shipping To
                        </h4>
                        <p className="text-sm text-gray-600">
                          {form.firstName} {form.lastName}
                          <br />
                          {form.address}
                          <br />
                          {form.city}, {form.state} - {form.postal}
                          <br />
                          {form.phone} • {form.email}
                        </p>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-xs text-indigo-600 hover:underline mt-2 font-medium"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-indigo-600 text-lg">
                            payments
                          </span>
                          Payment Method
                        </h4>
                        <p className="text-sm text-gray-600 capitalize font-medium">
                          {payment}
                        </p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-xs text-indigo-600 hover:underline mt-2 font-medium"
                        >
                          Edit
                        </button>
                      </div>

                      {/* Items Summary */}
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">
                          Order Items ({cart.length})
                        </h4>
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {item.name} x{item.quantity}
                              </span>
                              <span className="text-gray-900 font-medium">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            arrow_back
                          </span>{" "}
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSubmit}
                          className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/40 transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined">
                            lock
                          </span>
                          Place Order • ₹{finalTotal.toLocaleString()}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right - Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg sticky top-28"
              >
                <div className="p-5 md:p-6 border-b border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">
                      shopping_bag
                    </span>
                    Order Summary
                  </h3>
                </div>

                {/* Items */}
                <div className="p-5 md:p-6 space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 group">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 font-semibold">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <span className="text-gray-900">₹{shipping}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600 font-semibold">
                      -₹{discount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-indigo-600">
                        ₹{finalTotal.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <p className="text-xs text-green-600 font-medium">
                          You save ₹{discount.toLocaleString()}!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
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
