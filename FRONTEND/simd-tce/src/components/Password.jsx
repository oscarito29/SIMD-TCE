import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./style/password.css";

const Password = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      Swal.fire({
        title: "Error",
        text: "La nueva contraseña y la confirmación no coinciden",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    if (form.newPassword.length < 8) {
      Swal.fire({
        title: "Error",
        text: "La nueva contraseña debe tener al menos 8 caracteres",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Error",
        text: "No se encontró sesión activa",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    try {
      const res = await fetch("https://simd-tce.duckdns.org/api/cambiar-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "Éxito",
          text: data.message || "Contraseña actualizada correctamente ✅",
          icon: "success",
          confirmButtonColor: "#2563eb",
        }).then(() => {
          navigate("/dashboard", { replace: true });
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "No se pudo cambiar la contraseña",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error en el servidor",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="password-container">
      <h1>Cambiar Contraseña</h1>
      <form className="password-form" onSubmit={handleSubmit}>
        <label>
          Contraseña actual:
          <input
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Nueva contraseña:
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Confirmar nueva contraseña:
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="save-btn">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default Password;
