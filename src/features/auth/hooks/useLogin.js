import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { login } from "../../../store/userSlice";
import { authStorage } from "../../../lib/auth-storage";
import { authApi } from "../api/auth.api";
import { tokenManager } from "../../../api/token-manager";

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(payload);

      const responseData = response.data;

      const data = responseData?.data ?? responseData;

      const { access, refresh, user } = data;

      if (!access || !refresh || !user) {
        throw new Error("Invalid login response from server.");
      }

      /*
       * Save JWT tokens
       */
      tokenManager.setTokens({
        access,
        refresh,
      });

      /*
       * Save logged-in user
       */
      authStorage.setUser(user);

      /*
       * Update Redux state
       */
      dispatch(login(user));

      /*
       * Redirect
       */
      navigate("/dashboard", {
        replace: true,
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      const responseData = error?.response?.data;

      const message =
        responseData?.message ||
        responseData?.detail ||
        "Unable to login. Please check your credentials.";

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
    loginUser,
    isLoading,
    error,
  };
}
