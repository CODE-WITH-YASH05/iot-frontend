import { tokenManager } from "../../../api/token-manager";

export const isAuthenticated = () => {
  return Boolean(tokenManager.getAccessToken());
};
