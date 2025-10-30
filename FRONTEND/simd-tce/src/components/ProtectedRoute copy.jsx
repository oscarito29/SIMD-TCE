import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// allowedRoles es un array de roles que pueden acceder a la ruta
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol"); // Ej: "Recepción", "Médico", etc.

  if (!token) {
    // No está logueado
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(rol)) {
    // No tiene permisos
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien, renderizamos la ruta
  return <Outlet />;
};

export default ProtectedRoute;