import { useState, useEffect } from "react";
import "./style/parametros.css";
import { apiFetch } from "../utils/api";

const Parametros = () => {
  const [form, setForm] = useState({
    nombre_hospital: "",
    logo: "",
    direccion: "",
    telefono: "",
    correo: "",
    idioma: "es",
    zona_horaria: "America/Guatemala",
    formato_fecha: "DD/MM/YYYY",
    politica_password: "min8",
    tiempo_sesion: 30,
    intentos_login: 3,
    especialidades: "",
    estados_pacientes: "",
    diagnosticos: "",
    horarios: "",
    moneda: "Q",
    iva: 12,
    prefijo_expedientes: "EXP",
  });

  // Cargar parámetros desde el backend
  useEffect(() => {
    // fetch("https://simd-tce.duckdns.org/api/parametros")
    fetch("http://localhost:5000/api/parametros")
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) setForm(data);
      })
      .catch((err) => console.error("Error cargando parámetros:", err));
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Guardar parámetros
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const res = await apiFetch("https://simd-tce.duckdns.org/api/parametros", {
      const res = await apiFetch("http://localhost:5000/api/parametros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      alert(data.message || "✅ Parámetros actualizados correctamente");
    } catch (err) {
      alert("❌ Error al guardar parámetros");
      console.error(err);
    }
  };

  return (
    <div className="parametros-container">
      <h1>⚙️ Configuración de Parámetros</h1>

      <form onSubmit={handleSubmit} className="parametros-form">
        {/* Generales */}
        <section>
          <h2>Generales</h2>
          <div className="parametros-grid">
            <label>
              Nombre Hospital/Clínica:
              <input
                type="text"
                name="nombre_hospital"
                value={form.nombre_hospital}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Logo (URL):
              <input
                type="text"
                name="logo"
                value={form.logo}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Dirección:
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Teléfono:
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Correo:
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Idioma:
              <select
                name="idioma"
                value={form.idioma}
                onChange={handleChange}
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </label>
          </div>
        </section>

        {/* Seguridad */}
        <section>
          <h2>Seguridad</h2>
          <label>
            Política de contraseñas:
            <select
              name="politica_password"
              value={form.politica_password}
              onChange={handleChange}
            >
              <option value="min8">Mínimo 8 caracteres</option>
              <option value="min10">Mínimo 10 caracteres</option>
              <option value="strong">Fuerte (Mayus, Num, Símbolos)</option>
            </select>
          </label>
          <label>
            Tiempo de sesión (minutos):
            <input
              type="number"
              name="tiempo_sesion"
              value={form.tiempo_sesion}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Intentos de login permitidos:
            <input
              type="number"
              name="intentos_login"
              value={form.intentos_login}
              onChange={handleChange}
              required
            />
          </label>
        </section>

        {/* Médicos / Operativos */}
        <section>
          <h2>Médicos / Operativos</h2>
          <label>
            Especialidades (coma):
            <input
              type="text"
              name="especialidades"
              value={form.especialidades}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Estados de pacientes (coma):
            <input
              type="text"
              name="estados_pacientes"
              value={form.estados_pacientes}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Tipos de diagnóstico (coma):
            <input
              type="text"
              name="diagnosticos"
              value={form.diagnosticos}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Horarios disponibles:
            <input
              type="text"
              name="horarios"
              value={form.horarios}
              onChange={handleChange}
            />
          </label>
        </section>

        {/* Administrativos */}
        <section>
          <h2>Administrativos</h2>
          <label>
            Moneda:
            <input
              type="text"
              name="moneda"
              value={form.moneda}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            IVA (%):
            <input
              type="number"
              name="iva"
              value={form.iva}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Prefijo para expedientes:
            <input
              type="text"
              name="prefijo_expedientes"
              value={form.prefijo_expedientes}
              onChange={handleChange}
              required
            />
          </label>
        </section>

        <button type="submit" className="save-btn">
          💾 Guardar Parámetros
        </button>
      </form>
    </div>
  );
};

export default Parametros;
