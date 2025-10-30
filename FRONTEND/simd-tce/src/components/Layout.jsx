import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom"; // 🔹 agregamos useLocation
import "./style/layout.css";

const Layout = () => {
  const [activo, setActivo] = useState("Inicio");
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 🔹 ruta actual

  // const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userName, setUserName] = useState("");
  const [rol, setRol] = useState(""); // 🔹 Guardamos el rol del usuario

  // 🔹 Obtenemos datos del usuario
  useEffect(() => {
    const nombre = localStorage.getItem("nombre");
    const rolUsuario = localStorage.getItem("rol");
    if (nombre) setUserName(nombre);
    if (rolUsuario) setRol(rolUsuario);
  }, []);

  // 🔹 Tema
/*   useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]); */
/* 
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  }; */

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

 /*  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombre");
    navigate("/", { replace: true });
  }; */

  const handleLogout = async () => {
  const username = localStorage.getItem("username");

  try {
    await fetch("https://simd-tce.duckdns.org/api/bitacora/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        accion: "Logout"
      }),
    });
  } catch (error) {
    console.error("Error registrando bitácora:", error);
  }

  // Limpiar sesión local
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("nombre");
  localStorage.removeItem("username");
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
      {
        nombre: "Configuración",
        icono: "⚙️",
        subItems: [
          { nombre: "Médicos", icono: "👨‍⚕️", ruta: "/configuracion/medicos" },
          { nombre: "Roles", icono: "🛡️", ruta: "/configuracion/roles" },
          { nombre: "Parámetros", icono: "🛠️", ruta: "/configuracion/parametros" },
          { nombre: "Bitácora", icono: "📘", ruta: "/configuracion/bitacora" },
        ],
      }
    );
  } else if (rol === "Médico") {
    menuItems.push(
      {
        nombre: "Pacientes",
        icono: "🧑‍⚕️",
        subItems: [
          { nombre: "Lista", icono: "📋", ruta: "/pacientes" },
          { nombre: "Citas", icono: "📆", ruta: "/pacientes/citas" },
        ],
      },
      { nombre: "Monitoreo", icono: "📊", ruta: "/monitoreo" }
    );
  } else if (rol === "Enfermería") {
    menuItems.push(
      { nombre: "Pacientes", icono: "🧑‍⚕️", ruta: "/pacientes" },
      { nombre: "Monitoreo", icono: "📊", ruta: "/monitoreo" }
    );
  } else if (rol === "Recepción") {
    menuItems.push({
      nombre: "Pacientes",
      icono: "🧑‍⚕️",
      subItems: [
        { nombre: "Lista", icono: "📋", ruta: "/pacientes" },
        { nombre: "Registrar", icono: "➕", ruta: "/pacientes/registrar" },
        { nombre: "Citas", icono: "📆", ruta: "/pacientes/citas" },
      ],
    });
  } else if (rol === "Financiero") {
    menuItems.push({ nombre: "Reportes", icono: "📄", ruta: "/reportes" });
  } else if (rol === "Técnico de Laboratorio") {
    menuItems.push({ nombre: "Laboratorio", icono: "🧪", ruta: "/laboratorio" });
  }

  /* if (rol === "Administrador") {
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
      // { nombre: "Reportes", icono: "📄", ruta: "/reportes" },
      {
        nombre: "Configuración",
        icono: "⚙️",
        subItems: [
          { nombre: "Médicos", icono: "👨‍⚕️", ruta: "/configuracion/medicos" },
          { nombre: "Roles", icono: "🛡️", ruta: "/configuracion/roles" },
          { nombre: "Parámetros", icono: "🛠️", ruta: "/configuracion/parametros" },
          { nombre: "Bitácora", icono: "📘", ruta: "/configuracion/bitacora" },
          
        ],
      }
    );
  } else if (rol === "Recepción") {
    menuItems.push({
      nombre: "Pacientes",
      icono: "🧑‍⚕️",
      subItems: [
        { nombre: "Lista", icono: "📋", ruta: "/pacientes" },
        { nombre: "Registrar", icono: "➕", ruta: "/pacientes/registrar" },
        { nombre: "Citas", icono: "📆", ruta: "/pacientes/citas" },
      ],
    });
  } else if (rol === "Médico") {
    menuItems.push(
      { nombre: "Monitoreo", icono: "📊", ruta: "/monitoreo" },
      // { nombre: "Diagnóstico", icono: "🧠", ruta: "/diagnostico" },
      // { nombre: "Monitoreo", icono: "📊", ruta: "/monitoreo" }

    );
  } else if (rol === "Financiero") {
    menuItems.push({ nombre: "Reportes", icono: "📄", ruta: "/reportes" });
  } */

  // 🔹 Actualizar el menú activo según la ruta actual
  useEffect(() => {
    const path = location.pathname;

    const findActivo = (items) => {
      for (let item of items) {
        if (item.ruta === path) return item.nombre; // menú principal
        if (item.subItems) {
          const sub = item.subItems.find(sub => sub.ruta === path);
          if (sub) return sub.nombre; // submenú
        }
      }
      return "Inicio"; // fallback
    };

    setActivo(findActivo(menuItems));
  }, [location.pathname, menuItems]);

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
