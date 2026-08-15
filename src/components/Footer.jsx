import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full py-16 px-4 md:px-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span
                className="material-symbols-outlined text-white text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                hexagon
              </span>
            </div>
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Vigyaan
            </span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed">
            © 2026 Vigyaan_IOT. Engineered for the Future.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">
            Resources
          </h4>
          <Link
            to="/contact"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Global Support
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Shipping
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Documentation
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">
            Legal
          </h4>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Cookie Policy
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">
            Connect
          </h4>
          <div className="flex gap-3">
            {["globe", "mail", "chat", "call"].map((icon, i) => (
              <button
                key={i}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <span className="material-symbols-outlined text-lg">
                  {icon}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
