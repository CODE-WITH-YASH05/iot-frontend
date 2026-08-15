import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <div className="pt-32 pb-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-card p-16 rounded-2xl max-w-lg mx-4">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <span
              className="material-symbols-outlined text-5xl text-green-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">
            Order Confirmed!
          </h1>
          <p className="text-on-surface-variant mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-sm text-electric-teal mb-8">
            Order ID: #AERO-{Date.now().toString().slice(-8)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="cyber-button-primary px-8 py-3 rounded-full text-xs uppercase tracking-widest text-white font-bold"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="cyber-button-secondary px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
