import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Activity, CheckCircle2, Loader2 } from "lucide-react";
import "./style/monitoreo.css";
import { apiFetch } from "../utils/api";

const Monitoreo = () => {
  const [data, setData] = useState({ pacientes: [], citas: [], alertas: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró token. Por favor inicia sesión.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await apiFetch("http://localhost:5000/api/monitoreo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          setError("Token inválido o expirado. Por favor inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error(`Error al obtener datos: ${res.statusText}`);

        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        console.error("❌ Error en fetch:", err);
        setError("No se pudieron cargar los datos del monitoreo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader2 className="spinner" size={48} />
        <p>Cargando datos del monitoreo...</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  // ✅ Función segura: evita errores si nivel_riesgo es undefined o null
  const obtenerColor = (nivel) => {
    if (!nivel) return "#ccc"; // gris por defecto
    const nivelLower = nivel.toLowerCase();
    if (nivelLower.includes("roja")) return "#ff4d4d";
    if (nivelLower.includes("amarilla")) return "#ffb84d";
    return "#4caf50"; // verde por defecto
  };

  const obtenerIcono = (nivel) => {
    if (!nivel) return <Activity color="gray" />;
    const nivelLower = nivel.toLowerCase();
    if (nivelLower.includes("roja")) return <AlertTriangle color="red" />;
    if (nivelLower.includes("amarilla")) return <Activity color="orange" />;
    return <CheckCircle2 color="green" />;
  };

  return (
    <div className="monitoreo-container">
      <h1 className="titulo">🧠 Monitoreo Inteligente del Consultorio</h1>

      {/* 🔹 ALERTAS DE IA */}
      <section className="alertas">
        <h2>Alertas Generadas por la IA Médica</h2>
        {data.alertas && data.alertas.length > 0 ? (
          <div className="alertas-grid">
            {data.alertas.map((alerta, i) => (
              <motion.div
                key={i}
                className="alerta-card"
                style={{
                  borderLeft: `6px solid ${obtenerColor(alerta.nivel_riesgo)}`,
                  background: `linear-gradient(90deg, ${obtenerColor(alerta.nivel_riesgo)}22, #fff)`,
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setAlertaSeleccionada(alerta)}
              >
                <div className="alerta-header">
                  {obtenerIcono(alerta.nivel_riesgo)}
                  <strong>{alerta.paciente || "Desconocido"}</strong>
                </div>
                <p className="nivel">{alerta.nivel_riesgo || "Sin nivel"}</p>
                <p className="descripcion">{alerta.descripcion || "Sin descripción disponible."}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p>No hay alertas activas.</p>
        )}
      </section>

      {/* 🔹 PANEL DE DETALLE DE ALERTA */}
      {alertaSeleccionada && (
        <motion.div
          className="detalle-alerta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Detalles del Paciente</h3>
          <p><strong>Paciente:</strong> {alertaSeleccionada.paciente || "N/A"}</p>
          <p><strong>DNI:</strong> {alertaSeleccionada.dni || "N/A"}</p>
          <p><strong>Riesgo:</strong> {alertaSeleccionada.nivel_riesgo || "No especificado"}</p>
          <p>{alertaSeleccionada.descripcion || "Sin descripción."}</p>
          <button onClick={() => setAlertaSeleccionada(null)}>Cerrar</button>
        </motion.div>
      )}

      {/* 🔹 PACIENTES */}
      <section className="pacientes">
        <h2>Pacientes Ingresados</h2>
        {data.pacientes && data.pacientes.length > 0 ? (
          <div className="tabla-scroll">
            <table className="tabla">
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
                {data.pacientes.map((p) => (
                  <tr key={p.dni}>
                    <td>{p.dni || "N/A"}</td>
                    <td>{p.nombre || "Sin nombre"}</td>
                    <td>{p.edad || "N/A"}</td>
                    <td>{p.sexo || "N/A"}</td>
                    <td>{p.estado_actual || "Desconocido"}</td>
                    <td>{p.fecha_ingreso || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay pacientes registrados.</p>
        )}
      </section>

      {/* 🔹 CITAS */}
      <section className="citas">
        <h2>Próximas Citas</h2>
        {data.citas && data.citas.length > 0 ? (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Especialidad</th>
                </tr>
              </thead>
              <tbody>
                {data.citas.map((c) => (
                  <tr key={`${c.fecha}-${c.hora}-${c.paciente}`}>
                    <td>{c.fecha || "N/A"}</td>
                    <td>{c.hora || "N/A"}</td>
                    <td>{c.paciente || "N/A"}</td>
                    <td>{c.especialidad || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay citas programadas.</p>
        )}
      </section>
    </div>
  );
};

export default Monitoreo;
