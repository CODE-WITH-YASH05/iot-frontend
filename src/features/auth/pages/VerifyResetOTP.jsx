import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useForgotPassword } from "../hooks/useForgotPassword";

export default function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    verifyResetOTP,
    sendResetOTP,
    isVerifying,
    isResending,
    error,
    setError,
  } = useForgotPassword();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);

  // Get email from location state or localStorage
  const email =
    location.state?.email || localStorage.getItem("resetEmail") || "";

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-hide resend success message
  useEffect(() => {
    if (resendSuccess) {
      const timer = setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [resendSuccess]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (error) {
      setError(null);
    }
  };

  // Handle key down
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
    if (error) setError(null);
  };

  // Handle verify
  const handleVerify = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    const result = await verifyResetOTP(email, otpString);

    if (result.success) {
      // Navigate to reset password page
      navigate("/reset-password", {
        replace: true,
        state: {
          email: email,
          resetToken: result.resetToken,
        },
      });
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    const result = await sendResetOTP(email);
    setIsResending(false);

    if (result.success) {
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeLeft(60);
      setCanResend(false);
      setResendSuccess(true);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Get input classes
  const getInputClasses = (index) => {
    const baseClasses =
      "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 transition-all";

    if (error) {
      return `${baseClasses} border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50 text-red-900`;
    }
    if (otp[index]) {
      return `${baseClasses} border-indigo-300 focus:border-indigo-500 focus:ring-indigo-100 bg-indigo-50 text-indigo-900`;
    }
    return `${baseClasses} border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 bg-gray-50 text-gray-900`;
  };

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
                  verified
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Verify OTP
              </h2>
              <p className="text-gray-500 mt-1.5 text-sm">
                Enter the 6-digit OTP sent to
              </p>
              <p className="text-indigo-600 font-semibold text-sm mt-1">
                {email}
              </p>
            </div>

            {/* Resend Success */}
            <AnimatePresence>
              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"
                >
                  <p className="text-sm text-blue-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      check_circle
                    </span>
                    OTP resent successfully! Please check your email.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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
            </AnimatePresence>

            {/* OTP Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">
                  Enter 6-digit OTP
                </label>
                <div
                  className="flex justify-center gap-2"
                  onPaste={handlePaste}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={getInputClasses(index)}
                      disabled={isVerifying}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Enter the OTP sent to your email
                </p>
              </div>

              {/* Verify Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isVerifying || otp.join("").length !== 6}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </motion.button>

              {/* Resend Section */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Didn't receive the OTP?</p>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || isResending || isVerifying}
                    className={`text-sm font-medium transition-colors ${
                      canResend && !isResending && !isVerifying
                        ? "text-indigo-600 hover:text-indigo-700"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isResending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-indigo-600/40 border-t-indigo-600 rounded-full animate-spin" />
                        Resending...
                      </span>
                    ) : canResend ? (
                      "Resend OTP"
                    ) : (
                      `Resend in ${formatTime(timeLeft)}`
                    )}
                  </button>
                </div>
                {timeLeft < 10 && timeLeft > 0 && !canResend && (
                  <p className="text-xs text-red-400 mt-1 animate-pulse">
                    OTP expires in {formatTime(timeLeft)}
                  </p>
                )}
              </div>

              {/* Back to Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("resetEmail");
                    navigate("/forgot-password", { replace: true });
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <span className="material-symbols-outlined text-sm">
                    arrow_back
                  </span>
                  Use different email
                </button>
              </div>
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
