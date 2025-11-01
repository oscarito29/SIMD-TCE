import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './style/login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await apiFetch('http://localhost:5000//api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // sessionStorage.setItem('token', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("rol", data.rol);

      if (onLogin) onLogin(data.token);a
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        icon: "success",
        confirmButtonColor: "#2563eb"
      });
      navigate('/dashboard', { replace: true });
    } else {
      Swal.fire({
        title: "Error",
        text: data.message || "Credenciales inválidas",
        icon: "error",
        confirmButtonColor: "#dc2626"
      });
    }
  }; */

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await apiFetch('http://localhost:5000//api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("rol", data.rol);

      if (onLogin) onLogin(data.token);
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        icon: "success",
        confirmButtonColor: "#2563eb"
      });
      navigate('/dashboard', { replace: true });
    } else {
      // Si el usuario está inactivo
      if (response.status === 403) {
        Swal.fire({
          title: "Usuario inactivo",
          text: data.message || "No puede iniciar sesión",
          icon: "warning",
          confirmButtonColor: "#f59e0b"
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Credenciales inválidas",
          icon: "error",
          confirmButtonColor: "#dc2626"
        });
      }
    }
};

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Iniciar Sesión</h2>

        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">Ingresar</button>

        <p className="login-footer">
          © 2025 SIMD-TCE | Sistema Médico
        </p>
      </form>
    </div>
  );
};

export default Login;
