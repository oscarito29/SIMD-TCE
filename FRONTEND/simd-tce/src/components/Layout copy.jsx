import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "./style/layout.css";

const Layout = () => {
  const [activo, setActivo] = useState("Inicio");

  const seleccionarItem = (nombre) => {
    setActivo(nombre);
  };

  const menuItems = [
    { nombre: "Inicio", icono: "🏠", ruta: "/dashboard" },
    { nombre: "Pacientes", icono: "🧑", ruta: "/pacientes" },
    { nombre: "Monitoreo", icono: "📊", ruta: "/monitoreo" },
    { nombre: "Reportes", icono: "📄", ruta: "/reportes" },
    {
      nombre: "Configuración",
      icono: "⚙️",
      subItems: [
        { nombre: "Médicos", icono: "👨‍⚕️",  ruta: "/configuracion/usuarios" },
        { nombre: "Roles", icono: "🛡️", ruta: "/configuracion/roles" },
        { nombre: "Parámetros", icono: "🛠️", ruta: "/configuracion/parametros" },
      ],
    },
  ];

  return (
    <div className="layout-container">
      <Sidebar menuItems={menuItems} activo={activo} seleccionarItem={seleccionarItem} />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
