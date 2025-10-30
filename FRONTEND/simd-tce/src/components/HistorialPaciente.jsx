import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import "./style/historial.css";

const HistorialPaciente = () => {
  const { dni } = useParams(); 
  const [historial, setHistorial] = useState([]);
  const [form, setForm] = useState({
    antecedentes: "",
    consultas: "",
    medicacion: "",
    laboratorio: "",
    notas: "",
    escala_glasgow: "",
    evolucion_neuro: "",
    tratamientos: "",
    complicaciones: "",
  });

  const token = localStorage.getItem("token");

  // 🔹 Traer historial del paciente
  const fetchHistorial = async () => {
    try {
      const res = await fetch(`https://simd-tce.duckdns.org/api/pacientes/${dni}/historial`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener historial");
      const data = await res.json();
      setHistorial(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar el historial", "error");
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [dni]);

  // 🔹 Manejar cambios en el form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Guardar nueva entrada
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`https://simd-tce.duckdns.org/api/pacientes/${dni}/historial`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", data.message, "success");
        setForm({
          antecedentes: "",
          consultas: "",
          medicacion: "",
          laboratorio: "",
          notas: "",
          escala_glasgow: "",
          evolucion_neuro: "",
          tratamientos: "",
          complicaciones: "",
        });
        fetchHistorial();
      } else {
        Swal.fire("Error", data.message || "No se pudo guardar", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Ocurrió un problema en el servidor", "error");
    }
  };

  return (
    <div className="historial-container">
      <h1>Historial Clínico - Paciente {dni}</h1>

      {/* 🔹 Formulario */}
      <form className="historial-form" onSubmit={handleSubmit}>
        <h2>Registrar nueva entrada</h2>

        <label>Antecedentes médicos:
          <textarea name="antecedentes" value={form.antecedentes} onChange={handleChange} />
        </label>

        <label>Consultas previas:
          <textarea name="consultas" value={form.consultas} onChange={handleChange} />
        </label>

        <label>Medicación actual:
          <textarea name="medicacion" value={form.medicacion} onChange={handleChange} />
        </label>

        <label>Resultados de laboratorio / imágenes:
          <textarea name="laboratorio" value={form.laboratorio} onChange={handleChange} />
        </label>

        <label>Notas del médico:
          <textarea name="notas" value={form.notas} onChange={handleChange} />
        </label>

        <h3>Sección SIMD-TCE</h3>

        <label>Escala de Glasgow:
          <input type="text" name="escala_glasgow" value={form.escala_glasgow} onChange={handleChange} />
        </label>

        <label>Evolución neurológica:
          <textarea name="evolucion_neuro" value={form.evolucion_neuro} onChange={handleChange} />
        </label>

        <label>Tratamientos aplicados:
          <textarea name="tratamientos" value={form.tratamientos} onChange={handleChange} />
        </label>

        <label>Complicaciones:
          <textarea name="complicaciones" value={form.complicaciones} onChange={handleChange} />
        </label>

        <button type="submit" className="save-btn">Guardar Entrada</button>
      </form>

      {/* 🔹 Historial previo */}
      <div className="historial-list">
        <h2>Entradas previas</h2>
        {historial.length === 0 ? (
          <p>No hay historial registrado</p>
        ) : (
          historial.map((h) => (
            <div key={h.id} className="historial-card">
              <p><strong>Fecha:</strong> {new Date(h.fecha).toLocaleString()}</p>
              <p><strong>Antecedentes:</strong> {h.antecedentes}</p>
              <p><strong>Consultas:</strong> {h.consultas}</p>
              <p><strong>Medicacion:</strong> {h.medicacion}</p>
              <p><strong>Laboratorio:</strong> {h.laboratorio}</p>
              <p><strong>Notas:</strong> {h.notas}</p>
              <p><strong>Escala de Glasgow:</strong> {h.escala_glasgow}</p>
              <p><strong>Evolución neurológica:</strong> {h.evolucion_neuro}</p>
              <p><strong>Tratamientos:</strong> {h.tratamientos}</p>
              <p><strong>Complicaciones:</strong> {h.complicaciones}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorialPaciente;
