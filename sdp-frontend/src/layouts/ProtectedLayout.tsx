import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/contexts/auth-context";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "@/components/ui/navbar";

const ProtectedLayout: React.FC = () => {
  // Here you can add any layout-specific logic, such as checking authentication status
  // or fetching user data if needed.

  const location = useLocation();

  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavBar />
      <main className="flex-1 flex justify-center">
        <div className="w-full px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedLayout;
