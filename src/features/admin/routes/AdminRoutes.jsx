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

export default function AdminRoutes() {
  return (
    <Routes>
      {/* =========================
          PUBLIC ADMIN ROUTES
      ========================= */}

      <Route path="login" element={<AdminLogin />} />

      {/* =========================
          PROTECTED ADMIN ROUTES
      ========================= */}

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
        </Route>
      </Route>

      {/* Unknown admin route */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
