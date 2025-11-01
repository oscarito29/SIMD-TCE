import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './style/perfil.css';
import { apiFetch } from "../utils/api";

const Perfil = () => {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    especialidad: "",
    horario: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Traer perfil del usuario logueado
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No se encontró token. Inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    // fetch("https://simd-tce.duckdns.org/api/perfil", {
    apiFetch("http://localhost:5000/api/perfil", {
      headers: {
        "Authorization": `Bearer ${token}`,  // 🔹 así lo espera Flask
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado o error al obtener perfil");
        return res.json();
      })
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("Error al cargar el perfil");
        setLoading(false);
      });
  }, []);

  // Controlar cambios
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Guardar perfil
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // fetch("https://simd-tce.duckdns.org/api/perfil", {
    apiFetch("http://localhost:5000/api/perfil", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          Swal.fire({
            title: "¡Éxito!",
            text: data.message,
            icon: "success",
            confirmButtonColor: "#2563eb"
          }).then(() => {
            navigate("/dashboard"); // 🔹 Te redirige después del OK
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "No se pudo actualizar el perfil",
            icon: "error",
            confirmButtonColor: "#dc2626"
          });
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        Swal.fire({
          title: "Error",
          text: "Hubo un problema con la actualización",
          icon: "error",
          confirmButtonColor: "#dc2626"
        });
      });
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="perfil-container">
      <h1>Mi Perfil</h1>
      <form className="perfil-form" onSubmit={handleSubmit}>
        <label>
          Nombre Completo:
          <input
            type="text"
            name="nombre"
            value={form.nombre}
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
          Teléfono:
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />
        </label>

        <label>
          Dirección:
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
          />
        </label>

        <label>
          Especialidad:
          <input
            type="text"
            name="especialidad"
            value={form.especialidad}
            onChange={handleChange}
          />
        </label>

        <label>
          Horario:
          <input
            type="text"
            name="horario"
            value={form.horario}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="save-btn">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default Perfil;
