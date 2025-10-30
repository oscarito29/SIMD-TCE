import React, { useState } from "react";
import './style/reportesPacientes.css';

const ReportePaciente = () => {
  const [dni, setDni] = useState("");
  const [paciente, setPaciente] = useState(null);

  const buscarPaciente = () => {
    if (!dni) return;
    fetch(`https://simd-tce.duckdns.org/api/pacientes/reporte/${dni}`)
      .then(res => res.json())
      .then(data => setPaciente(data))
      .catch(err => alert("Paciente no encontrado o error en la búsqueda"));
  };

  const imprimir = () => window.print();

  return (
    <div className="reporte-container">
      <h1>Reporte de Paciente</h1>

      <div className="buscar-dni">
        <input
          type="text"
          placeholder="Ingrese DNI del paciente"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
        <button onClick={buscarPaciente}>Buscar</button>
      </div>

      {paciente && (
        <div className="ficha-paciente">
          {/* Logo del consultorio */}
          <div className="logo-consultorio">
            <img src="/img/logo_consultorio.png" alt="Consultorio" />
          </div>

          <h2>{paciente.nombre} ({paciente.dni})</h2>

          <section className="datos-generales">
            <h3>Datos Generales</h3>
            <p><strong>Edad:</strong> {paciente.edad}</p>
            <p><strong>Sexo:</strong> {paciente.sexo}</p>
            <p><strong>Lugar de Procedencia:</strong> {paciente.lugar_procedencia}</p>
            <p><strong>Fecha de Ingreso:</strong> {paciente.fecha_ingreso}</p>
            <p><strong>Fecha de Salida:</strong> {paciente.fecha_salida || "N/A"}</p>
          </section>

          <section className="diagnostico">
            <h3>Diagnóstico y Estado</h3>
            <p><strong>Diagnóstico Inicial:</strong> {paciente.diagnostico_inicial}</p>
            <p><strong>Estado Actual:</strong> {paciente.estado_actual}</p>
          </section>

          <section className="alertas-ia">
            <h3>Sugerencias de IA</h3>
            {paciente.sugerencias_ia ? (
              <p>{paciente.sugerencias_ia}</p>
            ) : (
              <p>No hay alertas por el momento.</p>
            )}
          </section>

          <section className="roles-table">
            <h3>Historial Clínico</h3>
            {paciente.historial && paciente.historial.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Observación</th>
                    <th>Medicacion</th>
                  </tr>
                </thead>
                <tbody>
                  {paciente.historial.map((h, i) => (
                    <tr key={i}>
                      <td>{h.fecha}</td>
                      <td>{h.observacion}</td>
                      <td>{h.antecedentes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay historial registrado.</p>
            )}
          </section>

          <button className="btn-print" onClick={imprimir}>🖨️ Imprimir Reporte</button>
        </div>
      )}
    </div>
  );
};

export default ReportePaciente;
