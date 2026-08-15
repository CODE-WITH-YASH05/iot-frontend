import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout as logoutAction } from "../../../store/userSlice";
import { authStorage } from "../../../lib/auth-storage";
import { authApi } from "../api/auth.api";

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = async () => {
    const refreshToken = authStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await authApi.logout({
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Always clear local authentication
      authStorage.clear();

      // Clear Redux authentication
      dispatch(logoutAction());

      // Go to login
      navigate("/login", {
        replace: true,
      });
    }
  };

  return {
    logoutUser,
  };
}
