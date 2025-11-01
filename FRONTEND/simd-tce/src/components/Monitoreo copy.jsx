import React, { useState, useEffect } from "react";
import './style/monitoreo.css';

const Monitoreo = () => {
  const [data, setData] = useState({ pacientes: [], citas: [], alertas: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token"); // Obtener el token guardado al login
    if (!token) {
      setError("No se encontró token. Por favor inicia sesión.");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await apiFetch("http://localhost:5000//api/monitoreo", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          // Token inválido o expirado
          setError("Token inválido o expirado. Por favor inicia sesión nuevamente.");
          return;
        }

        if (!res.ok) {
          throw new Error(`Error al obtener los datos: ${res.statusText}`);
        }

        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>;
  }

  return (
    <div className="monitoreo-container">
      <h1>Monitoreo del Consultorio</h1>

      <section className="alertas">
        <h2>Alertas de IA</h2>
       {/*  {data.alertas.length === 0 ? (
          <p>No hay alertas por el momento.</p>
        ) : (
          <ul>
            {data.alertas.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        )} */}
      </section>

      <section className="pacientes">
        <h2>Pacientes Ingresados</h2>
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
            {data.pacientes.map(p => (
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
      </section>

      <section className="citas">
        <h2>Citas Próximas</h2>
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
      </section>
    </div>
  );
};

export default Monitoreo;
