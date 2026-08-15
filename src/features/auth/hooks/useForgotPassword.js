import { useState } from "react";
import { authApi } from "../api/auth.api";

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  // Step 1: Send OTP for forgot password
  const sendResetOTP = async (email) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authApi.forgotPassword({ email });
      const responseData = response.data;

      setSuccess(true);
      return {
        success: true,
        data: responseData?.data ?? responseData,
        message: responseData?.message || "OTP sent to your email!",
      };
    } catch (error) {
      const responseData = error?.response?.data;

      let message =
        responseData?.message ||
        responseData?.detail ||
        "Failed to send OTP. Please try again.";

      // Handle field-specific errors
      if (typeof responseData === "object" && !responseData.message) {
        const firstFieldError = Object.values(responseData)
          .flat()
          .find((value) => typeof value === "string");

        if (firstFieldError) {
          message = firstFieldError;
        }
      }

      setError(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyResetOTP = async (email, otp) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await authApi.verifyResetOTP({ email, otp });
      const responseData = response.data;

      // Store the reset token for password reset
      const token =
        responseData?.data?.reset_token || responseData?.reset_token || null;

      if (token) {
        setResetToken(token);
        localStorage.setItem("resetToken", token);
      }

      return {
        success: true,
        data: responseData?.data ?? responseData,
        resetToken: token,
        message: responseData?.message || "OTP verified successfully!",
      };
    } catch (error) {
      const responseData = error?.response?.data;

      let message =
        responseData?.message ||
        responseData?.detail ||
        "Invalid OTP. Please try again.";

      if (typeof responseData === "object" && !responseData.message) {
        const firstFieldError = Object.values(responseData)
          .flat()
          .find((value) => typeof value === "string");

        if (firstFieldError) {
          message = firstFieldError;
        }
      }

      setError(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 3: Reset password
  const resetPassword = async (password, confirmPassword) => {
    setIsResetting(true);
    setError(null);

    const token = resetToken || localStorage.getItem("resetToken");

    if (!token) {
      setError("Invalid reset session. Please try again.");
      setIsResetting(false);
      return {
        success: false,
        error: "Invalid reset session",
      };
    }

    try {
      const response = await authApi.resetPassword({
        reset_token: token,
        password,
        confirm_password: confirmPassword,
      });

      const responseData = response.data;

      // Clear the reset token
      localStorage.removeItem("resetToken");
      setResetToken(null);

      return {
        success: true,
        data: responseData?.data ?? responseData,
        message: responseData?.message || "Password reset successfully!",
      };
    } catch (error) {
      const responseData = error?.response?.data;

      let message =
        responseData?.message ||
        responseData?.detail ||
        "Failed to reset password. Please try again.";

      if (typeof responseData === "object" && !responseData.message) {
        const firstFieldError = Object.values(responseData)
          .flat()
          .find((value) => typeof value === "string");

        if (firstFieldError) {
          message = firstFieldError;
        }
      }

      setError(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsResetting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(false);
  };

  return {
    sendResetOTP,
    verifyResetOTP,
    resetPassword,
    isLoading,
    isVerifying,
    isResetting,
    error,
    success,
    resetToken,
    setError,
    clearError,
    clearSuccess,
  };
}
