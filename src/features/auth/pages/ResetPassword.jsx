import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useForgotPassword } from "../hooks/useForgotPassword";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, isResetting, error, setError, clearError } =
    useForgotPassword();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get reset token from location state
  const resetToken =
    location.state?.resetToken || localStorage.getItem("resetToken");

  // Redirect if no token
  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const result = await resetPassword(newPassword, confirmPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message: "Password reset successfully! Please login.",
          },
        });
      }, 2000);
    }
  };

  const isPasswordMatch = confirmPassword && newPassword === confirmPassword;
  const isPasswordError = confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 mb-5">
                <span
                  className="material-symbols-outlined text-white text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  password
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Reset Password
              </h2>
              <p className="text-gray-500 mt-1.5 text-sm">
                Enter your new password
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
              >
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    check_circle
                  </span>
                  Password reset successfully! Redirecting to login...
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    error_outline
                  </span>
                  {error}
                </p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Min. 8 characters"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    lock_reset
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Re-enter password"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                      isPasswordError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : isPasswordMatch
                          ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                          : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                    }`}
                  />
                </div>
                {isPasswordError && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      error
                    </span>
                    Passwords do not match
                  </p>
                )}
                {isPasswordMatch && (
                  <p className="text-green-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">Password must contain:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li
                    className={newPassword.length >= 8 ? "text-green-600" : ""}
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(newPassword) ? "text-green-600" : ""
                    }
                  >
                    At least one uppercase letter
                  </li>
                  <li
                    className={
                      /[a-z]/.test(newPassword) ? "text-green-600" : ""
                    }
                  >
                    At least one lowercase letter
                  </li>
                  <li
                    className={
                      /[0-9]/.test(newPassword) ? "text-green-600" : ""
                    }
                  >
                    At least one number
                  </li>
                </ul>
              </div>

              {/* Reset Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={
                  isResetting ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  newPassword.length < 8
                }
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                {isResetting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>

            {/* Back to Login */}
            <p className="text-center text-gray-500 text-sm mt-6">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
