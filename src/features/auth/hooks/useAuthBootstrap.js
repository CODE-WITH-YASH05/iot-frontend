import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { authStorage } from "../../../lib/auth-storage";
import { login, logout } from "../../../store/userSlice";
import { authApi } from "../api/auth.api";

export function useAuthBootstrap() {
  const dispatch = useDispatch();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const accessToken = authStorage.getAccessToken();
        const refreshToken = authStorage.getRefreshToken();

        if (!accessToken || !refreshToken) {
          dispatch(logout());
          return;
        }

        const response = await authApi.getProfile();

        const user = response.data?.data ?? response.data?.user;

        if (!user) {
          throw new Error("Invalid profile response from server.");
        }

        dispatch(login(user));

        authStorage.setUser(user);
      } catch (error) {
        console.error("Auth bootstrap failed:", error);

        authStorage.clear();

        dispatch(logout());
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return {
    isInitializing,
  };
}
