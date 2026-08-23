import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminProtectedRoute from "./AdminProtectedRoute";

import AdminProducts from "../pages/products/AdminProducts";
import AddProduct from "../pages/products/AddProduct";
import AdminCategories from "../pages/AdminCategories";
import AdminBrands from "../pages/AdminBrands";
import AdminInventory from "../pages/AdminInventory";
import AdminReviews from "../pages/Reviews";
import AdminWishlist from "../pages/Wishlist";
import AdminCart from "../pages/AdminCart";
import AdminUsers from "../pages/AdminUsers";
import AdminUserDetail from "../pages/AdminUserDetail";
import AdminOrders from "../pages/AdminOrders";
import AdminOrderDetails from "../pages/AdminOrderDetails";
export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* /admin */}
          <Route index element={<AdminDashboard />} />

          {/* /admin/products */}
          <Route path="products" element={<AdminProducts />} />

          {/* /admin/products/add */}
          <Route path="products/add" element={<AddProduct />} />

          {/* /admin/products/:id */}
          <Route path="products/:id" element={<AddProduct />} />

          {/* /admin/categories */}
          <Route path="categories" element={<AdminCategories />} />

          {/* /admin/brands */}
          <Route path="brands" element={<AdminBrands />} />

          {/* /admin/inventory */}
          <Route path="inventory" element={<AdminInventory />} />

          {/* /admin/reviews */}
          <Route path="reviews" element={<AdminReviews />} />

          {/* /admin/wishlist */}
          <Route path="wishlist" element={<AdminWishlist />} />

          {/* /admin/AdminCart */}
          <Route path="AdminCart" element={<AdminCart />} />

          {/* /admin/AdminUsers */}
          <Route path="AdminUsers" element={<AdminUsers />} />

          {/* /admin/AdminUserDetail */}
          <Route path="users/:userId" element={<AdminUserDetail />} />

          {/* /admin/AdminOrders */}
          <Route path="AdminOrders" element={<AdminOrders />} />

          {/* /admin/AdminOrders */}
          <Route path="/orders/:orderId" element={<AdminOrderDetails />} />
        </Route>
      </Route>

      {/* =========================
          UNKNOWN ADMIN ROUTE
      ========================= */}

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
