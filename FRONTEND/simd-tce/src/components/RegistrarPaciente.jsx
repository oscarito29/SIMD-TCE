import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./style/registrarPaciente.css";

const RegistrarPaciente = () => {
  const [form, setForm] = useState({
    dni: "",
    nombre: "",
    fecha_nacimiento: "",
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

  const [dniError, setDniError] = useState(""); // ← Validación en tiempo real
  const [pacientes, setPacientes] = useState([]); // ← Lista de pacientes existentes

  const navigate = useNavigate();

  // 🔹 Traer pacientes existentes al cargar el componente
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://simd-tce.duckdns.org/api/pacientes", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setPacientes(data);
      } catch (err) {
        console.error("Error cargando pacientes:", err);
      }
    };
    fetchPacientes();
  }, []);

  // 🔹 Validación en tiempo real del DNI
  useEffect(() => {
    if (!form.dni.trim()) {
      setDniError("");
      return;
    }
    const dniExistente = pacientes.find((p) => p.dni === form.dni);
    setDniError(dniExistente ? `El DNI "${form.dni}" ya está registrado` : "");
  }, [form.dni, pacientes]);

  // 🔹 Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedForm = { ...form, [name]: type === "checkbox" ? checked : value };

    // 🔹 Calcular edad automáticamente si cambia fecha de nacimiento
    if (name === "fecha_nacimiento") {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updatedForm.edad = age >= 0 ? age.toString() : "";
    }

    setForm(updatedForm);
  };

  // 🔹 Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dniError) {
      Swal.fire("Error", dniError, "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No se encontró sesión activa", "error");
      return;
    }

    try {
      const res = await fetch("https://simd-tce.duckdns.org/api/pacientes", {
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
        <div className="form-grid">

          <label style={{ display: 'block', marginBottom: '5px' }}>
            DNI:
            <input
              type="text"
              name="dni"
              value={form.dni}
              maxLength="13"
              pattern="\d{13}"
              title="El DNI debe tener exactamente 13 dígitos numéricos"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm({ ...form, dni: value });
                if (value.length === 13) setDniError("");
              }}
              onBlur={(e) => {
                if (e.target.value.length !== 13) {
                  setDniError("El DNI debe tener exactamente 13 dígitos");
                } else {
                  setDniError("");
                }
              }}
              required
              style={{ display: 'block', width: '100%', marginTop: '5px' }}
            />
          </label>

          {dniError && (
            <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              {dniError}
            </p>
          )}



          {/* Nombre */}
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

          {/* Fecha de nacimiento */}
          <label>
            Fecha de nacimiento:
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </label>

          {/* Edad */}
          <label>
            Edad:
            <input type="number" name="edad" value={form.edad} readOnly required />
          </label>

          {/* Sexo */}
          <label>
            Sexo:
            <select name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </label>

          {/* Lugar de procedencia */}
          <label>
            Lugar de Procedencia:
            <input
              type="text"
              name="lugar_procedencia"
              value={form.lugar_procedencia}
              onChange={handleChange}
            />
          </label>

          {/* Diagnóstico inicial */}
          <label>
            Diagnóstico Inicial:
            <input
              type="text"
              name="diagnostico_inicial"
              value={form.diagnostico_inicial}
              onChange={handleChange}
            />
          </label>

          {/* Estado actual */}
          <label>
            Estado Actual:
            <input
              type="text"
              name="estado_actual"
              value={form.estado_actual}
              onChange={handleChange}
            />
          </label>

          {/* Checkbox TCE */}
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="es_tce"
              checked={form.es_tce}
              onChange={handleChange}
            />
            ¿Paciente con TCE?
          </label>

          {form.es_tce && (
            <>
              {/* Detalles TCE */}
              <h3 style={{ gridColumn: "1 / -1" }}>Detalles TCE</h3>

              <label>
                Tipo de lesión:
                <select
                  name="tipo_lesion"
                  value={form.tipo_lesion}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Grave">Grave</option>
                </select>
              </label>
              <label>
                Mecanismo de lesión:
                <input
                  type="text"
                  name="mecanismo_lesion"
                  value={form.mecanismo_lesion}
                  onChange={handleChange}
                />
              </label>
              <label>
                Escala de Glasgow al ingreso:
                <input
                  type="number"
                  name="escala_glasgow_ingreso"
                  min="3"
                  max="15"
                  value={form.escala_glasgow_ingreso}
                  onChange={handleChange}
                />
              </label>
              <label>
                Evolución Glasgow:
                <input
                  type="text"
                  name="escala_glasgow_evolucion"
                  value={form.escala_glasgow_evolucion}
                  onChange={handleChange}
                />
              </label>
              <label>
                TAC inicial:
                <textarea
                  name="tac_inicial"
                  value={form.tac_inicial}
                  onChange={handleChange}
                />
              </label>
              <label>
                Complicaciones:
                <textarea
                  name="complicaciones"
                  value={form.complicaciones}
                  onChange={handleChange}
                />
              </label>
            </>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={!!dniError}>
          Guardar Paciente
        </button>
      </form>
    </div>
  );
};

export default RegistrarPaciente;
