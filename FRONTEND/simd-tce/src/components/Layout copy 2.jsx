import React, { useState, useEffect, useRef, } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import "./style/layout.css";

const Layout = () => {
  const [activo, setActivo] = useState("Inicio");
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();


  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const menuRef = useRef(null);

  // Cierra el menú si haces clic fuera
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
    sessionStorage.removeItem("token");
    navigate("/", { replace: true });
  };



  return (
    <div className="layout-container">

      <Sidebar
        menuItems={[
          { nombre: "Inicio", icono: "🏠", ruta: "/dashboard" },
          // { nombre: "Pacientes", icono: "🧑‍⚕️", ruta: "/pacientes" },
          {
            nombre: "Pacientes",
            icono: "🧑‍⚕️",
            subItems: [
              { nombre: "Lista", icono: "📋", ruta: "/pacientes" },
              { nombre: "Registrar", icono: "➕", ruta: "/pacientes/registrar" },
              // { nombre: "Historial Clínico", icono: "📑", ruta: "/pacientes/historial/:dni" },
              { nombre: "Citas", icono: "📆", ruta: "/pacientes/citas" },
              { nombre: "Reportes", icono: "📊", ruta: "/pacientes/reportes" },
            ]
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
          },
        ]}
        activo={activo}
        seleccionarItem={seleccionarItem}
      />

      <div className="main-area">
        {/* 🔹 Barra superior */}
        {/* <header className="topbar">
          <div className="user-menu">
            <button
              className="user-avatar"
              onClick={() => setOpenMenu(!openMenu)}
            >
              👤 Mi Cuenta
            </button>

            {openMenu && (
              <div className="dropdown-menu">
                <button onClick={() => navigate("/perfil")}>
                  ✏️ Modificar Perfil
                </button>
                <button onClick={() => navigate("/cambiar-password")}>
                  🔑 Cambiar Contraseña
                </button>
                <button onClick={handleLogout}>🚪 Cerrar Sesión</button>
              </div>
            )}
          </div>
        </header> */}

        <header className="topbar">
          <div className="user-menu" ref={menuRef}>
            <button
              className="user-button"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <span className="user-avatar-circle">👤</span>
              <span className="user-name">Mi Cuenta</span>
              <span className="user-caret">▼</span>
            </button>

            {/* {openMenu && (
              <div className="dropdown-menu">
                <button onClick={() => navigate("/perfil")}>
                  ✏️ Modificar Perfil
                </button>
                <button onClick={() => navigate("/cambiar-password")}>
                  🔑 Cambiar Contraseña
                </button>
                <button onClick={handleLogout}>🚪 Cerrar Sesión</button>
              </div>
            )} */}

            {openMenu && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    navigate("/perfil");
                    setOpenMenu(false); // 🔹 Cierra el menú
                  }}
                >
                  ✏️ Modificar Perfil
                </button>
                <button
                  onClick={() => {
                    navigate("/cambiar-password");
                    setOpenMenu(false); // 🔹 Cierra el menú
                  }}
                >
                  🔑 Cambiar Contraseña
                </button>
             {/*    <button onClick={toggleTheme}>
                  {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
                </button> */}

                <button
                  onClick={() => {
                    handleLogout();
                    setOpenMenu(false); // 🔹 También aquí
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
