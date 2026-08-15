import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark pt-20 flex items-center justify-center">
      <div className="text-center">
        <span className="text-9xl">🔌</span>
        <h1 className="text-6xl font-bold text-white mt-4">404</h1>
        <p className="text-gray-400 mt-2 text-xl">Page not found</p>
        <Link
          to="/"
          className="text-primary mt-4 inline-block text-lg hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
