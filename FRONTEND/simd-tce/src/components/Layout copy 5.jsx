import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import "./style/layout.css";

const Layout = () => {
  const [activo, setActivo] = useState("Inicio");
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userName, setUserName] = useState("");
  const [rol, setRol] = useState(""); // 🔹 Guardamos el rol del usuario

  useEffect(() => {
    const nombre = localStorage.getItem("nombre");
    const rolUsuario = localStorage.getItem("rol"); // 🔹 Obtenemos el rol
    if (nombre) setUserName(nombre);
    if (rolUsuario) setRol(rolUsuario);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const menuRef = useRef(null);

  // 🔹 Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const seleccionarItem = (nombre) => {
    setActivo(nombre);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombre");
    navigate("/", { replace: true });
  };

  // ==========================================================
  // 🔹 MENÚS DIFERENTES SEGÚN EL ROL
  // ==========================================================
  let menuItems = [
    { nombre: "Inicio", icono: "🏠", ruta: "/dashboard" },
  ];

  if (rol === "Administrador") {
    menuItems.push(
      {
        nombre: "Pacientes",
        icono: "🧑‍⚕️",
        subItems: [
          { nombre: "Lista", icono: "📋", ruta: "/pacientes" },
          { nombre: "Registrar", icono: "➕", ruta: "/pacientes/registrar" },
          { nombre: "Citas", icono: "📆", ruta: "/pacientes/citas" },
          { nombre: "Reportes", icono: "📊", ruta: "/pacientes/reportes" },
        ],
      },
      { nombre: "Monitoreo", icono: "📊", ruta: "/monitoreo" },
      { nombre: "Reportes", icono: "📄", ruta: "/reportes" },
      {
        nombre: "Configuración",
        icono: "⚙️",
        subItems: [
          { nombre: "Médicos", icono: "👨‍⚕️", ruta: "/configuracion/medicos" },
          { nombre: "Roles", icono: "🛡️", ruta: "/configuracion/roles" },
          { nombre: "Parámetros", icono: "🛠️", ruta: "/configuracion/parametros" },
        ],
      }
    );
  }

  // 🧩 Recepción: solo pacientes y citas
  else if (rol === "Recepción") {
    menuItems.push({
      nombre: "Pacientes",
      icono: "🧑‍⚕️",
      subItems: [
        { nombre: "Lista", icono: "📋", ruta: "/pacientes" },
        { nombre: "Registrar", icono: "➕", ruta: "/pacientes/registrar" },
        { nombre: "Citas", icono: "📆", ruta: "/pacientes/citas" },
      ],
    });
  }

  // 🩺 Médico: solo monitoreo y diagnóstico
  else if (rol === "Médico") {
    menuItems.push(
      { nombre: "Monitoreo", icono: "📊", ruta: "/monitoreo" },
      { nombre: "Diagnóstico", icono: "🧠", ruta: "/diagnostico" }
    );
  }

  // 💰 Financiera: solo reportes
  else if (rol === "Financiero") {
    menuItems.push({ nombre: "Reportes", icono: "📄", ruta: "/reportes" });
  }

  return (
    <div className="layout-container">
      <Sidebar
        menuItems={menuItems}
        activo={activo}
        seleccionarItem={seleccionarItem}
      />

      <div className="main-area">
        {/* 🔹 Barra superior */}
        <header className="topbar">
          <div className="user-menu" ref={menuRef}>
            <button className="user-button" onClick={() => setOpenMenu(!openMenu)}>
              <span className="user-avatar-circle">👤</span>
              <span className="user-name">{userName || "Mi Cuenta"}</span>
              <span className="user-caret">▼</span>
            </button>

            {openMenu && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    navigate("/perfil");
                    setOpenMenu(false);
                  }}
                >
                  ✏️ Modificar Perfil
                </button>
                <button
                  onClick={() => {
                    navigate("/cambiar-password");
                    setOpenMenu(false);
                  }}
                >
                  🔑 Cambiar Contraseña
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpenMenu(false);
                  }}
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 🔹 Contenido principal */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
