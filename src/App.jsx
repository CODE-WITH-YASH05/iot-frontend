import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AdminRoutes from "./features/admin/routes/AdminRoutes";

// ==========================================================
// PUBLIC / MAIN PAGES
// ==========================================================

import Home from "./features/home/pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import Blog from "./features/Blog/pages/Blog";
import BlogDetail from "./features/Blog/pages/BlogDetail";

// ==========================================================
// PRODUCT
// ==========================================================

import Category from "./features/products/pages/Category";
import Brands from "./features/products/pages/Brands";
import BrandDetail from "./features/products/pages/BrandDetail";

// ==========================================================
// REVIEWS / WISHLIST / ADDRESS
// ==========================================================

import Reviews from "./features/reviews/components/reviews";
import Wishlist from "./features/wishlist/pages/Wishlist";
import Address from "./features/Address/pages/Address";

// ==========================================================
// CART
// ==========================================================

import Cart from "./features/Cart/pages/Cart";

// ==========================================================
// ORDERS
// ==========================================================

import Checkout from "./features/Orders/pages/Checkout";
import OrderSuccess from "./features/orders/pages/OrderSuccess";
import Orders from "./features/orders/pages/Orders";
import OrderDetails from "./features/orders/pages/OrderDetails";

// ==========================================================
// AUTHENTICATION
// ==========================================================

import VerifyEmail from "./features/auth/pages/VerifyEmail";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import VerifyResetOTP from "./features/auth/pages/VerifyResetOTP";
import ResetPassword from "./features/auth/pages/ResetPassword";

// ==========================================================
// AUTHENTICATION
// ==========================================================
import Contact from "./features/Contact/pages/Contact";

function App() {
  return (
    <Routes>
      {/* ================================================== */}
      {/* PUBLIC ROUTES */}
      {/* ================================================== */}

      <Route path="/" element={<Home />} />

      <Route path="/shop" element={<Shop />} />

      <Route path="/product/:slug" element={<ProductDetail />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/blog" element={<Blog />} />

      <Route path="/blog/:slug" element={<BlogDetail />} />

      <Route path="/brands" element={<Brands />} />

      <Route path="/brand/:slug" element={<BrandDetail />} />

      <Route path="/category/:slug" element={<Category />} />

      <Route path="/reviews" element={<Reviews />} />

      <Route path="/wishlist" element={<Wishlist />} />

      <Route path="/address" element={<Address />} />

      {/* ================================================== */}
      {/* ORDERS */}
      {/* ================================================== */}

      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<OrderDetails />} />

      {/* ================================================== */}
      {/* AUTHENTICATION */}
      {/* ================================================== */}

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================================================== */}
      {/* ADMIN */}
      {/* ================================================== */}

      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* ================================================== */}
      {/* PROTECTED ROUTES */}
      {/* ================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/order-success" element={<OrderSuccess />} />
      </Route>

      {/* ================================================== */}
      {/* CART */}
      {/* ================================================== */}

      <Route path="/cart" element={<Cart />} />

      {/* ================================================== */}
      {/* 404 */}
      {/* ================================================== */}

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
