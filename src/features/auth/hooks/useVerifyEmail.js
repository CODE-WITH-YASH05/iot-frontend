import { useState } from "react";
import { authApi } from "../api/auth.api";

export function useVerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authApi.verifyEmail({ email, otp });
      const responseData = response.data;

      setSuccess(true);
      return {
        success: true,
        data: responseData?.data ?? responseData,
        message: responseData?.message || "Email verified successfully!",
      };
    } catch (error) {
      const responseData = error?.response?.data;

      let message =
        responseData?.message ||
        responseData?.detail ||
        "Invalid OTP. Please try again.";

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

  const resendOTP = async (email) => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);
    setResendMessage("");

    try {
      const response = await authApi.resendOTP({ email });
      const responseData = response.data;

      const message =
        responseData?.message ||
        responseData?.detail ||
        "OTP resent successfully! Please check your email.";

      setResendSuccess(true);
      setResendMessage(message);

      return {
        success: true,
        message: message,
        data: responseData?.data ?? responseData,
      };
    } catch (error) {
      const responseData = error?.response?.data;

      let message =
        responseData?.message ||
        responseData?.detail ||
        "Failed to resend OTP. Please try again.";

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
      setIsResending(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(false);
    setResendSuccess(false);
    setResendMessage("");
  };

  return {
    verifyOTP,
    resendOTP,
    isLoading,
    isResending,
    error,
    success,
    resendSuccess,
    resendMessage,
    setError,
    clearError,
    clearSuccess,
  };
}
