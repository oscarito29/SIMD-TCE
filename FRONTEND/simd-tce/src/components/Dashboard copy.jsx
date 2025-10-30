import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [activo, setActivo] = useState("Inicio");

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

  const menuItems = [
    { nombre: "Inicio", icono: "🏠" },
    { nombre: "Pacientes", icono: "👨‍⚕️" },
    { nombre: "Monitoreo", icono: "📊" },
    { nombre: "Reportes", icono: "📄" },
    { nombre: "Configuración", icono: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menú lateral */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <h1 className="text-2xl font-bold text-center py-6 border-b border-blue-700">SIMD-TCE</h1>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.nombre}
              onClick={() => setActivo(item.nombre)}
              className={`w-full flex items-center p-2 rounded transition-colors duration-200 ${
                activo === item.nombre
                  ? "bg-blue-700 text-white"
                  : "hover:bg-blue-800 text-gray-200"
              }`}
            >
              <span className="mr-2">{item.icono}</span>
              {item.nombre}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700 text-center text-gray-300 text-sm">
          © 2025 SIMD-TCE
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Bienvenido, Dr. Martínez</h1>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold">Pacientes Totales</h2>
            <p className="text-3xl font-bold">{stats.pacientes}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold">Alertas Críticas</h2>
            <p className="text-3xl font-bold">{stats.alertasCriticas}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-lg font-semibold">Reportes Generados</h2>
            <p className="text-3xl font-bold">{stats.reportesGenerados}</p>
          </div>
        </div>

        {/* Alertas recientes */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">Alertas Recientes</h2>
          <ul>
            {alertas.map((a) => (
              <li key={a.id} className="border-b py-2 flex justify-between">
                <span>
                  {a.paciente} - {a.alerta} - {a.fecha}
                </span>
                <span
                  className={`font-bold ${
                    a.estado === "Pendiente" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {a.estado}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gráfico */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Alertas por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="alertas" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
