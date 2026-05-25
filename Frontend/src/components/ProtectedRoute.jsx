// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import BottomNavbar from "./BottomNavbar";

export default function ProtectedRoute() {
  const location = useLocation();
  
  // 💡 Simple boolean flag set by AuthPage when success is true
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    // Redirect cleanly back to login page if unauthenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 📱 Main Content Area Viewport Scroll Canvas */}
      <main className="flex-1 w-full overflow-y-auto">
        <Outlet />
      </main>

      {/* ⚡ DISPLAY NAVBAR: Positioned cleanly at the viewport base across all protected paths */}
      <BottomNavbar />
    </div>
  );
}