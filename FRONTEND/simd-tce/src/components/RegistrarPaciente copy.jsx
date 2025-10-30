import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./style/registrarPaciente.css";

const RegistrarPaciente = () => {
  const [form, setForm] = useState({
    dni: "",
    nombre: "",
    edad: "",
    sexo: "M",
    lugar_procedencia: "",
    diagnostico_inicial: "",
    estado_actual: "",
    es_tce: false,
    tipo_lesion: "",
    mecanismo_lesion: "",
    escala_glasgow_ingreso: "",
    escala_glasgow_evolucion: "",
    tac_inicial: "",
    complicaciones: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No se encontró sesión activa", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", data.message, "success").then(() =>
          navigate("/pacientes")
        );
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Ocurrió un error en el servidor", "error");
    }
  };

  return (
    <div className="paciente-container">
      <h1>Registrar Paciente</h1>
      <form onSubmit={handleSubmit} className="paciente-form">
        <label>DNI: <input type="text" name="dni" value={form.dni} onChange={handleChange} required /></label>
        {/* <label>Nombre: <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required /></label> */}

        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value.toUpperCase() })
            }
            required
          />
        </label>

        <label>Edad: <input type="number" name="edad" value={form.edad} onChange={handleChange} required /></label>
        <label>Sexo:
          <select name="sexo" value={form.sexo} onChange={handleChange}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </label>
        <label>Lugar de Procedencia:
          <input type="text" name="lugar_procedencia" value={form.lugar_procedencia} onChange={handleChange} />
        </label>
        <label>Diagnóstico Inicial:
          <input type="text" name="diagnostico_inicial" value={form.diagnostico_inicial} onChange={handleChange} />
        </label>
        <label>Estado Actual:
          <input type="text" name="estado_actual" value={form.estado_actual} onChange={handleChange} />
        </label>

        {/* 🔹 Opciones TCE */}
        <label>
          <input type="checkbox" name="es_tce" checked={form.es_tce} onChange={handleChange} />
          ¿Paciente con TCE?
        </label>

        {form.es_tce && (
          <div className="tce-section">
            <h3>Detalles TCE</h3>
            <label>Tipo de lesión:
              <select name="tipo_lesion" value={form.tipo_lesion} onChange={handleChange}>
                <option value="">Seleccione...</option>
                <option value="Leve">Leve</option>
                <option value="Moderado">Moderado</option>
                <option value="Grave">Grave</option>
              </select>
            </label>
            <label>Mecanismo de lesión:
              <input type="text" name="mecanismo_lesion" value={form.mecanismo_lesion} onChange={handleChange} />
            </label>
            <label>Escala de Glasgow al ingreso:
              <input type="number" name="escala_glasgow_ingreso" min="3" max="15" value={form.escala_glasgow_ingreso} onChange={handleChange} />
            </label>
            <label>Evolución Glasgow:
              <input type="text" name="escala_glasgow_evolucion" value={form.escala_glasgow_evolucion} onChange={handleChange} />
            </label>
            <label>TAC inicial:
              <textarea name="tac_inicial" value={form.tac_inicial} onChange={handleChange}></textarea>
            </label>
            <label>Complicaciones:
              <textarea name="complicaciones" value={form.complicaciones} onChange={handleChange}></textarea>
            </label>
          </div>
        )}

        <button type="submit" className="save-btn">Guardar Paciente</button>
      </form>
    </div>
  );
};

export default RegistrarPaciente;
