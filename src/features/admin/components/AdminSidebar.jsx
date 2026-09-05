import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdminAuth } from "../hooks/useAdminAuth";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: "dashboard" },
  { name: "Products", path: "/admin/products", icon: "inventory_2" },
  { name: "Categories", path: "/admin/categories", icon: "category" },
  { name: "Brands", path: "/admin/brands", icon: "storefront" },
  { name: "Orders", path: "/admin/AdminOrders", icon: "shopping_bag" },
  { name: "Customers", path: "/admin/AdminUsers", icon: "people" },
  { name: "Inventory", path: "/admin/inventory", icon: "warehouse" },
  { name: "Reviews", path: "/admin/reviews", icon: "reviews" },
  { name: "Settings", path: "/admin/settings", icon: "settings" },
  { name: "Wishlist", path: "/admin/wishlist", icon: "favorite" },
  { name: "Cart", path: "/admin/AdminCart", icon: "shopping_cart" },
  { name: "contact", path: "/admin/contact", icon: "contact_page" },
  { name: "Home", path: "/admin/AdminHome", icon: "home" },
  { name: "Blog", path: "/admin/AdminBlog", icon: "movie" },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { logout } = useAdminAuth();

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isOpen ? 256 : 80 }}
      className="fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-sm">
              hexagon
            </span>
          </div>
          {isOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Vigyaan Admin
            </span>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="p-3 space-y-1 overflow-y-auto h-[calc(100%-12rem)]">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              location.pathname === item.path
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">
              {item.icon}
            </span>
            {isOpen && <span className="text-sm font-medium">{item.name}</span>}
          </Link>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <span className="material-symbols-outlined text-xl flex-shrink-0">
            logout
          </span>
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 transition-all mt-1"
        >
          <span className="material-symbols-outlined text-xl flex-shrink-0">
            {isOpen ? "chevron_left" : "chevron_right"}
          </span>
          {isOpen && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </motion.div>
  );
}
