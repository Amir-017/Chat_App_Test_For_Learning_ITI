import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/react";

export const ProtectedRoute = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  return <Outlet />;
};
