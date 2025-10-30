import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './style/login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('https://simd-tce.duckdns.org/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('username', data.username);
      localStorage.setItem('rol', data.rol);

      if (onLogin) onLogin(data.token);

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Inicio de sesión exitoso",
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#2563eb",
        backdrop: true,
        allowOutsideClick: false,
        customClass: { popup: "swal-responsive" } // 👈 clase responsive
      }).then(() => {
        navigate('/dashboard', { replace: true });
      });

    } else if (response.status === 403) {
      Swal.fire({
        title: "Usuario inactivo",
        text: data.message || "No puede iniciar sesión",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#f59e0b",
        customClass: { popup: "swal-responsive" }
      });
    } else {
      Swal.fire({
        title: "Error",
        text: data.message || "Credenciales inválidas",
        icon: "error",
        confirmButtonText: "Intentar de nuevo",
        confirmButtonColor: "#dc2626",
        customClass: { popup: "swal-responsive" }
      });
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Iniciar Sesión</h2>

        <div className="input-group">
          <span className="input-icon">👤</span>
          {/* <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />  */}

          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            style={{ textTransform: 'lowercase' }}
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
