/* import React, { useState } from "react";

const Sidebar = ({ activo, setActivo }) => {
  const menuItems = [
    { nombre: "Inicio", icono: "🏠" },
    { nombre: "Pacientes", icono: "👨‍⚕️" },
    { nombre: "Monitoreo", icono: "📊" },
    { nombre: "Reportes", icono: "📄" },
    { nombre: "Configuración", icono: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">SIMD-TCE</h1>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.nombre}
            onClick={() => setActivo(item.nombre)}
            className={`sidebar-btn ${
              activo === item.nombre ? "activo" : ""
            }`}
          >
            <span className="sidebar-icon">{item.icono}</span>
            {item.nombre}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">© 2025 SIMD-TCE</div>
    </aside>
  );
};

export default Sidebar;
 */
// src/components/Sidebar.jsimport React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate

const Sidebar = ({ menuItems, activo, seleccionarItem }) => {
  const navigate = useNavigate(); // Inicializamos el hook useNavigate

  // Función para manejar el clic en un ítem del menú
  const handleItemClick = (itemRuta) => {
    seleccionarItem(itemRuta); // Establecemos el item activo
    // Navegamos dinámicamente usando la ruta del ítem
    navigate(itemRuta); // Usamos la ruta del item directamente
  };

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">SIMD-TCE</h1>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.nombre}
            onClick={() => handleItemClick(item.ruta)} // Llamamos a handleItemClick con la ruta
            className={`sidebar-button ${activo === item.nombre ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icono}</span>
            {item.nombre}
          </button>
        ))}
      </nav>
      <footer className="sidebar-footer">© 2025 SIMD-TCE</footer>
    </aside>
  );
};

export default Sidebar;

