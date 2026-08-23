import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser, useOrders, useWishlist, useCart } from "../store/useStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLogout } from "../features/auth/hooks/useLogout";

export default function Dashboard() {
  const { user, isLoggedIn } = useUser();
  const { logoutUser, isLoading: isLoggingOut } = useLogout();
  const { orders } = useOrders();
  const { wishlist } = useWishlist();
  const { cart } = useCart();

  const stats = [
    {
      icon: "shopping_bag",
      label: "Total Orders",
      value: orders.length,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: "favorite",
      label: "Wishlist Items",
      value: wishlist.length,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      icon: "shopping_cart",
      label: "Cart Items",
      value: cart.length,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      icon: "star",
      label: "Reviews",
      value: 0,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-16 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              Welcome back, {user?.name || "User"}! 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's your account overview.</p>
          </div>
          <button
            onClick={logoutUser}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            {
              icon: "shopping_bag",
              label: "My Orders",
              path: "/orders",
              color: "text-indigo-600",
            },
            {
              icon: "favorite",
              label: "Wishlist",
              path: "/wishlist",
              color: "text-pink-600",
            },
            {
              icon: "location_on",
              label: "Addresses",
              path: "/Address",
              color: "text-green-600",
            },
            {
              icon: "settings",
              label: "Settings",
              path: "/settings",
              color: "text-gray-600",
            },
          ].map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <span
                className={`material-symbols-outlined text-xl ${link.color}`}
              >
                {link.icon}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
                inventory_2
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start shopping to see your orders here.
              </p>
              <Link
                to="/shop"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-3"
                >
                  <div>
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {order.items?.length || 0} items
                    </span>
                    <span className="font-bold text-indigo-600">
                      ₹{order.total?.toLocaleString() || "0"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Name
              </p>
              <p className="text-gray-900 font-medium">
                {user?.name || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Email
              </p>
              <p className="text-gray-900 font-medium">
                {user?.email || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Phone
              </p>
              <p className="text-gray-900 font-medium">
                {user?.phone || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Member Since
              </p>
              <p className="text-gray-900 font-medium">
                {new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
