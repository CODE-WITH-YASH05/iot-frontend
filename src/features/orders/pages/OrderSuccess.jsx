import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function OrderSuccess() {
  const location = useLocation();

  // ==========================================================
  // ORDER DATA

  // ==========================================================

  const order = location.state?.order;

  // ==========================================================
  // SAFETY

  // ==========================================================

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  // ==========================================================
  // VALUES
  // ==========================================================

  const orderId = order.id;

  const totalAmount = Number(order.total_amount || 0);

  const itemCount = Array.isArray(order.items)
    ? order.items.reduce((total, item) => total + Number(item.quantity || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="pt-32 pb-20 flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center glass-card p-8 sm:p-12 md:p-16 rounded-2xl max-w-lg w-full mx-auto">
          {/* ================================================= */}
          {/* SUCCESS ICON */}
          {/* ================================================= */}

          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <span
              className="material-symbols-outlined text-5xl text-green-400"
              style={{
                fontVariationSettings: "'FILL' 1",
              }}
            >
              check_circle
            </span>
          </div>

          {/* ================================================= */}
          {/* TITLE */}
          {/* ================================================= */}

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Order Confirmed!
          </h1>

          <p className="text-on-surface-variant mb-2">
            Your order has been placed successfully.
          </p>

          {/* ================================================= */}
          {/* ORDER ID */}
          {/* ================================================= */}

          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-on-surface-variant mb-1">Order ID</p>

            <p className="text-sm md:text-base font-bold text-electric-teal break-all">
              #{orderId}
            </p>
          </div>

          {/* ================================================= */}
          {/* ORDER SUMMARY */}
          {/* ================================================= */}

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-on-surface-variant mb-1">Items</p>

              <p className="text-lg font-bold">{itemCount}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-on-surface-variant mb-1">Total</p>

              <p className="text-lg font-bold text-electric-teal">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="cyber-button-primary px-8 py-3 rounded-full text-xs uppercase tracking-widest text-white font-bold"
            >
              Continue Shopping
            </Link>

            <Link
              to="/orders"
              className="cyber-button-secondary px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold"
            >
              View Orders
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
