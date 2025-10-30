import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./style/dashboard.css";

const Dashboard = () => {
  const [activo, setActivo] = useState("Inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const stats = {
    pacientes: 25,
    alertasCriticas: 3,
    reportesGenerados: 12,
  };

  const alertas = [
    { id: 1, paciente: "Juan Pérez", alerta: "Presión Alta", fecha: "24/08/2025", estado: "Pendiente" },
    { id: 2, paciente: "María López", alerta: "Pulso Bajo", fecha: "23/08/2025", estado: "Atendida" },
  ];

  const dataChart = [
    { mes: "Ene", alertas: 5 },
    { mes: "Feb", alertas: 2 },
    { mes: "Mar", alertas: 4 },
    { mes: "Abr", alertas: 7 },
  ];

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const seleccionarItem = (nombre) => {
    setActivo(nombre);
    setMenuAbierto(false);
  };

  return (
    <div className="container">
      {/* Botón hamburguesa móvil */}
      <button className="btn-menu" onClick={toggleMenu} aria-label="Abrir menú">
        ☰
      </button>

      {/* Menú lateral */}
   {/*    <aside className={`sidebar ${menuAbierto ? "sidebar--abierto" : ""}`}>
        <h1 className="sidebar-title">SIMD-TCE</h1>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.nombre}
              onClick={() => seleccionarItem(item.nombre)}
              className={`sidebar-button ${activo === item.nombre ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icono}</span>
              {item.nombre}
            </button>
          ))}
        </nav>
        <footer className="sidebar-footer">© 2025 SIMD-TCE</footer>
      </aside> */}

      {/* Fondo overlay para menú móvil */}
      {menuAbierto && <div className="overlay" onClick={toggleMenu} />}

      {/* Contenido principal */}
      <main className="main-content">
        <h1 className="welcome-title">Bienvenido, Dr. Martínez</h1>

        {/* Estadísticas */}
        <section className="stats-grid">
          <div className="card bg-green">
            <h2>Pacientes Totales</h2>
            <p>{stats.pacientes}</p>
          </div>
          <div className="card bg-red">
            <h2>Alertas Críticas</h2>
            <p>{stats.alertasCriticas}</p>
          </div>
          <div className="card bg-blue">
            <h2>Reportes Generados</h2>
            <p>{stats.reportesGenerados}</p>
          </div>
        </section>

        {/* Alertas recientes */}
        <section className="alertas-card">
          <h2>Alertas Recientes</h2>
          <ul>
            {alertas.map((a) => (
              <li key={a.id} className="alerta-item">
                <span>{a.paciente} - {a.alerta} - {a.fecha}</span>
                <span className={`estado ${a.estado === "Pendiente" ? "pendiente" : "atendida"}`}>
                  {a.estado}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Gráfico */}
        <section className="grafico-card">
          <h2>Alertas por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="alertas" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
