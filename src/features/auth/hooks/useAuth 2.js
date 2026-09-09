import { useSelector } from "react-redux";

export function useAuth() {
  const user = useSelector((state) => state.user?.user);
  const isAuthenticated = useSelector((state) => state.user?.isAuthenticated);

  return {
    user,
    isAuthenticated,
  };
}
