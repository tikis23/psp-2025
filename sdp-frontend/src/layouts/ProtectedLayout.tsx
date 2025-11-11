import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/contexts/auth-context";
import type { LocationState } from "@/types";
import React from "react";
import { Navigate } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";

const ProtectedLayout: React.FC = () => {
  // Here you can add any layout-specific logic, such as checking authentication status
  // or fetching user data if needed.

  const location = useLocation();

  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    const state: LocationState = { from: location };
    return <Navigate to="/login" state={state} replace />
  }

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
