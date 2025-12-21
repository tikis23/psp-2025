import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/contexts/auth-context";
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/ui/navbar";

const ProtectedLayout: React.FC = () => {

  const { isLoading } = useAuth();

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
