import React, { useState, useEffect } from "react";

import { useNavigate, Link } from "react-router-dom";

import { motion } from "framer-motion";

import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();

  const { login, isLoading, error, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // ========================================================
  // REDIRECT IF ALREADY LOGGED IN
  // ========================================================

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin", {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  // ========================================================
  // SUBMIT
  // ========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return;
    }

    const result = await login(normalizedEmail, password);

    if (result.success) {
      navigate("/admin", {
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      {/* Background */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />

        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100">
          {/* Logo */}

          <div className="text-center mb-8">
            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                delay: 0.1,
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 mb-4"
            >
              <span className="material-symbols-outlined text-white text-4xl">
                hexagon
              </span>
            </motion.div>

            <h2 className="text-3xl font-black text-gray-900">Admin Login</h2>

            <p className="text-gray-500 text-sm mt-2">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Error */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-red-500">
                error_outline
              </span>

              <span className="text-sm text-red-600">{error}</span>
            </motion.div>
          )}

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  mail
                </span>

                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  lock
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Login */}

            <motion.button
              type="submit"
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    login
                  </span>
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">Secure admin access only</p>

            <Link
              to="/"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors inline-flex items-center gap-1 mt-2"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Back to Store
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
