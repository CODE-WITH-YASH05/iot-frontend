import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminNavbar() {
  const { user, logout } = useAdminAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 hidden md:block">
            Admin Panel
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 rounded-xl hover:bg-gray-50 transition-all relative">
            <span className="material-symbols-outlined text-gray-600">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0) || "A"}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user?.name || "Admin"}
              </span>
              <span className="material-symbols-outlined text-gray-400 text-sm hidden md:inline">
                expand_more
              </span>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="material-symbols-outlined text-base">
                    settings
                  </span>
                  Settings
                </Link>
                <Link
                  to="/admin/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="material-symbols-outlined text-base">
                    account_circle
                  </span>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all border-t border-gray-100"
                >
                  <span className="material-symbols-outlined text-base">
                    logout
                  </span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
