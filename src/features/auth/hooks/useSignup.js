import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authApi } from "../api/auth.api";

export function useSignup() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const signupUser = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(payload);

      const responseData = response.data;

      const data = responseData?.data ?? responseData;

      /*
       * Registration successful
       *
       * We do NOT save JWT tokens here.
       * User must verify email/OTP first.
       */

      return {
        success: true,
        data,
        message:
          responseData?.message || data?.message || "Registration successful.",
      };
    } catch (error) {
      const responseData = error?.response?.data;

      let message =
        responseData?.message ||
        responseData?.detail ||
        "Unable to create account. Please try again.";

      /*
       * Handle Django validation errors
       *
       * Example:
       * {
       *   email: ["A user with this email already exists."]
       * }
       */
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

  return {
    signupUser,
    isLoading,
    error,
  };
}
