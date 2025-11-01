import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./style/layout.css";
import { apiFetch } from "../utils/api";
import { jwtDecode } from "jwt-decode"; // ✅ versión actual de jwt-decode
import Swal from "sweetalert2";

const Layout = () => {
  const [activo, setActivo] = useState("Inicio");
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [rol, setRol] = useState("");

  const menuRef = useRef(null);

  // 🔹 Obtenemos datos del usuario
  useEffect(() => {
    const nombre = localStorage.getItem("nombre");
    const rolUsuario = localStorage.getItem("rol");
    if (nombre) setUserName(nombre);
    if (rolUsuario) setRol(rolUsuario);
  }, []);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  // 🔹 Función para cerrar sesión
  const handleLogout = async () => {
    const username = localStorage.getItem("username");

    try {
      await apiFetch("http://localhost:5000/api/bitacora/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, accion: "Logout" }),
      });
    } catch (error) {
      console.error("Error registrando bitácora:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombre");
    localStorage.removeItem("username");
    navigate("/", { replace: true });
  };

  // 🔹 Verificar expiración del token con SweetAlert
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Token inválido");
      handleLogout();
      return;
    }

    const exp = decoded.exp * 1000; // convertir a ms
    const now = Date.now();
    const timeout = exp - now;

    if (timeout <= 0) {
      Swal.fire({
        title: "Sesión expirada",
        text: "Tu sesión ha vencido, por favor inicia sesión nuevamente.",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#2563eb",
        allowOutsideClick: false,
      }).then(() => handleLogout());
    } else {
      const timer = setTimeout(() => {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha vencido, por favor inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#2563eb",
          allowOutsideClick: false,
        }).then(() => handleLogout());
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, []);

  // 🔹 Menú dinámico según rol
  let menuItems = [{ nombre: "Inicio", icono: "🏠", ruta: "/dashboard" }];
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

  // 🔹 Actualizar el menú activo según la ruta
  useEffect(() => {
    const path = location.pathname;
    const findActivo = (items) => {
      for (let item of items) {
        if (item.ruta === path) return item.nombre;
        if (item.subItems) {
          const sub = item.subItems.find((sub) => sub.ruta === path);
          if (sub) return sub.nombre;
        }
      }
      return "Inicio";
    };
    setActivo(findActivo(menuItems));
  }, [location.pathname, menuItems]);

  return (
    <div className="layout-container">
      <Sidebar menuItems={menuItems} activo={activo} seleccionarItem={(n) => setActivo(n)} />
      <div className="main-area">
        <header className="topbar">
          <div className="user-menu" ref={menuRef}>
            <button className="user-button" onClick={() => setOpenMenu(!openMenu)}>
              <span className="user-avatar-circle">👤</span>
              <span className="user-name">{userName || "Mi Cuenta"}</span>
              <span className="user-caret">▼</span>
            </button>

            {openMenu && (
              <div className="dropdown-menu">
                <button onClick={() => { navigate("/perfil"); setOpenMenu(false); }}>✏️ Modificar Perfil</button>
                <button onClick={() => { navigate("/cambiar-password"); setOpenMenu(false); }}>🔑 Cambiar Contraseña</button>
                <button onClick={() => { handleLogout(); setOpenMenu(false); }}>🚪 Cerrar Sesión</button>
              </div>
            )}
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
