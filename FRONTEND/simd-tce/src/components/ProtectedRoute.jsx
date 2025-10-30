/* import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) {
    // Si no hay sesión, siempre al login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(rol)) {
    // Si está logueado pero no tiene permiso
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const permisos = {
  Administrador: [
    "/dashboard",
    "/pacientes",
    "/pacientes/registrar",
    "/pacientes/historial/:dni",
    "/pacientes/citas",
    "/pacientes/reportes",
    "/monitoreo",
    "/reportes",
    "/perfil",
    "/cambiar-password",
    "/configuracion/medicos",
    "/configuracion/roles",
    "/configuracion/parametros",
    "/configuracion/bitacora",
  ],
  Médico: [
    "/dashboard",
    "/pacientes",
    "/pacientes/historial/:dni",
    "/pacientes/citas",
    "/monitoreo",
    "/perfil",
    "/cambiar-password",
  ],
  Enfermería: [
    "/dashboard",
    "/pacientes",
    "/pacientes/historial/:dni",
    "/monitoreo",
    "/perfil",
    "/cambiar-password",
  ],
  Recepción: [
    "/dashboard",
    "/pacientes",
    "/pacientes/registrar",
    "/pacientes/citas",
    "/perfil",
    "/cambiar-password",
  ],
  Financiero: [
    "/dashboard",
    "/reportes",
    "/perfil",
    "/cambiar-password",
  ],
  "Técnico de Laboratorio": [
    "/dashboard",
    "/laboratorio",
    "/perfil",
    "/cambiar-password",
  ],
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const rol = localStorage.getItem("rol"); // solo obtenemos el rol

  if (!rol) {
    return <Navigate to="/login" replace />;
  }

  const rolPermisos = permisos[rol] || [];
  const path = location.pathname;

  const rutaPermitida = rolPermisos.some(ruta => {
    const regex = new RegExp("^" + ruta.replace(":dni", "[^/]+") + "$");
    return regex.test(path);
  });

  if (!rutaPermitida) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
