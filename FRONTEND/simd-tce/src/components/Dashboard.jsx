import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import "./style/dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState({
    total_pacientes: 0,
    pacientes_criticos: 0,
    proximas_citas: [],
    ultimos_pacientes: [],
    alertas: [],
    pacientes_por_mes: []
  });
  const [error, setError] = useState("");
  const [chartKey, setChartKey] = useState(0); // 👈 clave para forzar redibujado

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró token. Por favor inicia sesión.");
      return;
    }

    const fetchData = async () => {
      try {
        // 🔗 Cambia esta URL si usas el servidor remoto
        const res = await apiFetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener datos del dashboard");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // 🔧 Forzar redibujado de los gráficos al cambiar tamaño o rotar pantalla
  useEffect(() => {
    const handleResize = () => setChartKey((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const pieData = [
    { name: "Estables", value: data.total_pacientes - data.pacientes_criticos },
    { name: "Críticos", value: data.pacientes_criticos }
  ];

  const COLORS = ["#4caf50", "#f44336"]; // Verde y rojo

  const handleCambiarEstado = async (citaId) => {
    const nombreUsuario = localStorage.getItem("nombre");

    try {
      const res = await apiFetch(`http://localhost:5000/api/citas/${citaId}/atender`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: nombreUsuario })
      });

      if (!res.ok) throw new Error("No se pudo actualizar la cita");

      // Actualizar estado en frontend
      setData((prevData) => ({
        ...prevData,
        proximas_citas: prevData.proximas_citas.map((c) =>
          c.id === citaId ? { ...c, estado: "Atendida" } : c
        )
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard SIMD-TCE</h1>

      {/* === KPIs === */}
      <div className="kpi-cards">
        <div className="card kpi">
          <h3>Total Pacientes</h3>
          <p>{data.total_pacientes}</p>
        </div>
        <div className="card kpi critical">
          <h3>Pacientes Críticos</h3>
          <p>{data.pacientes_criticos}</p>
        </div>
      </div>

      {/* === GRÁFICOS === */}
      <div className="charts-container">
        <div className="chart card">
          <h3>Estado de Pacientes</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%" key={chartKey}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart card">
          <h3>Pacientes por Mes</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%" key={chartKey}>
              <BarChart data={data.pacientes_por_mes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* === PRÓXIMAS CITAS === */}
      <section className="card roles-table">
        <h3>Próximas Citas</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Especialidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.proximas_citas.map((c) => (
                <tr key={c.id}>
                  <td>{c.fecha}</td>
                  <td>{c.hora}</td>
                  <td>{c.paciente}</td>
                  <td>{c.especialidad}</td>
                  <td>
                    {c.estado === "Confirmada" ? (
                      <button
                        onClick={() => handleCambiarEstado(c.id)}
                        className="btn-pendiente"
                      >
                        Pendiente
                      </button>
                    ) : (
                      <span className="estado-atendida">Atendida</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === ÚLTIMOS PACIENTES === */}
      <section className="card roles-table">
        <h3>Últimos Pacientes Ingresados</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Estado</th>
                <th>Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimos_pacientes.map((p) => (
                <tr key={p.dni}>
                  <td>{p.dni}</td>
                  <td>{p.nombre}</td>
                  <td>{p.edad}</td>
                  <td>{p.sexo}</td>
                  <td>{p.estado_actual}</td>
                  <td>{p.fecha_ingreso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === ALERTAS === */}
      {data.alertas.length > 0 && (
        <section className="card alertas-section">
          <h3>Alertas Recientes</h3>
          {data.alertas.map((a, index) => (
            <div key={index} className={`alerta-item ${a.tipo}`}>
              <span>{a.mensaje}</span>
              <span className="estado">{a.estado}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
