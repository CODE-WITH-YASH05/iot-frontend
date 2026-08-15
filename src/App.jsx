import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AdminRoutes from "./features/admin/routes/AdminRoutes";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import OrderSuccess from "./pages/OrderSuccess";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Category from "./features/products/pages/Category";
import Brands from "./features/products/pages/Brands";
import BrandDetail from "./features/products/pages/BrandDetail";

// Authentication Pages
import VerifyEmail from "./features/auth/pages/VerifyEmail";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import VerifyResetOTP from "./features/auth/pages/VerifyResetOTP";
import ResetPassword from "./features/auth/pages/ResetPassword";

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/brand/:slug" element={<BrandDetail />} />
      <Route path="/category/:slug" element={<Category />} />

      {/* Forgot Password Routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= ADMIN ROUTES ================= */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* ================= PROTECTED ROUTES ================= */}

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Route>

      {/* ================= CART ================= */}

      <Route path="/cart" element={<Cart />} />

      {/* ================= 404 ================= */}

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
