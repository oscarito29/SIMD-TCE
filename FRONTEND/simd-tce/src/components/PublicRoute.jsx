import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("token");

  if (token) {
    // Si ya está logueado, redirige al dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // No está logueado, deja pasar
  return <Outlet />;
};

export default PublicRoute;
