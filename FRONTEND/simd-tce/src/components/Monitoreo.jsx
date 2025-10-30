import React, { useState, useEffect } from "react";
import "./style/monitoreo.css";

const Monitoreo = () => {
  const [data, setData] = useState({ pacientes: [], citas: [], alertas: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró token. Por favor inicia sesión.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("https://simd-tce.duckdns.org/api/monitoreo", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          setError("Token inválido o expirado. Por favor inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Error al obtener los datos: ${res.statusText}`);
        }

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
    return <p style={{ textAlign: "center", marginTop: "1rem" }}>Cargando datos...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>{error}</p>;
  }

  return (
    <div className="monitoreo-container">
      <h1>Monitoreo del Consultorio</h1>

      {/* 🔹 SECCIÓN DE ALERTAS DE IA */}
      <section className="alertas">
        <h2>Alertas de IA</h2>
        {data.alertas && data.alertas.length > 0 ? (
           <ul className="alertas-lista">
            {data.alertas.map((alerta, i) => {
              let color = "black";
              let icon = "⚪";

              if (alerta.nivel_riesgo.toLowerCase().includes("roja")) {
                color = "red";
                icon = "🔴";
              } else if (alerta.nivel_riesgo.toLowerCase().includes("amarilla")) {
                color = "orange";
                icon = "🟠";
              } else if (alerta.nivel_riesgo.toLowerCase().includes("verde")) {
                color = "green";
                icon = "🟢";
              }

              return (
                <li key={i} className="alerta-item" style={{ color, fontWeight: "bold" }}>
                  {icon} {alerta.paciente}: {alerta.nivel_riesgo}
                  <br />
                  <span style={{ fontWeight: "normal", color: "#333" }}>{alerta.descripcion}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No hay alertas por el momento.</p>
        )}
      </section>

      {/* 🔹 SECCIÓN DE PACIENTES */}
      <section className="pacientes">
        <h2>Pacientes Ingresados</h2>
        {data.pacientes.length > 0 ? (
          <table className="roles-table">
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
        ) : (
          <p>No hay pacientes registrados.</p>
        )}
      </section>

      {/* 🔹 SECCIÓN DE CITAS */}
      <section className="citas">
        <h2>Citas Próximas</h2>
        {data.citas.length > 0 ? (
          <table className="roles-table">
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
                  <td>{c.fecha}</td>
                  <td>{c.hora}</td>
                  <td>{c.paciente}</td>
                  <td>{c.especialidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay citas programadas.</p>
        )}
      </section>
    </div>
  );
};

export default Monitoreo;
