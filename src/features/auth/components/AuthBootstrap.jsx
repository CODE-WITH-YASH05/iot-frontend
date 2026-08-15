import { useAuthBootstrap } from "../hooks/useAuthBootstrap";

function AuthBootstrap({ children }) {
  const { isInitializing } = useAuthBootstrap();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return children;
}

export default AuthBootstrap;