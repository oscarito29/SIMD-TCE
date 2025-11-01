/* import React, { useState } from 'react';
import './style/login.css';

const Login = ({ onLogin }) => {
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await apiFetch('http://localhost:5000//api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      onLogin(data.token); // Llama a la función del padre
    } else {
      alert(data.message || 'Credenciales inválidas');
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="login-title">Iniciar Sesión</h2>
      <input
        type="text"
        className="login-input"
        placeholder="Código de Médico"
        value={username}
        onChange={(e) => setusername(e.target.value)}
        required
      />
      <input
        type="password"
        className="login-input"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="login-button">Ingresar</button>
    </form>
  );
};

export default Login;
 */
/* 
import React, { useState } from 'react';
import './style/login.css';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const Login = ({ onLogin }) => {
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiFetch('http://localhost:5000//api/login', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
        
        // Almacenar el token en sessionStorage
        sessionStorage.setItem('token', data.token);
        // Llamar a la función onLogin del componente padre
        onLogin(data.token);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error al conectarse con el backend:', error);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="login-title">Iniciar Sesión</h2>
      <input
        type="text"
        className="login-input"
        placeholder="Código de Médico"
        value={username}
        onChange={(e) => setusername(e.target.value)}
        required
      />
      <input
        type="password"
        className="login-input"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="login-button">Ingresar</button>
    </form>
  );
};

export default Login;
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import correcto
import './style/login.css';
import Swal from 'sweetalert2';


const Login = ({ onLogin }) => {
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Solo funciona si estás dentro de un Router

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await apiFetch('http://localhost:5000//api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      sessionStorage.setItem('token', data.token);
      if (onLogin) onLogin(data.token);
      navigate('/dashboard', { replace: true });
      Swal.fire({
        title: "ÉXITO",
        text: "Inicio de Sesión Válido",
        icon: "success"
      });

    } else {
      // alert(data.message || 'Credenciales inválidas');
      Swal.fire({
        title: "ERROR",
        text: "Error en Inicio de Sesión",
        icon: "error"
      });

    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="login-title">Iniciar Sesión</h2>
      <input type="text" className="login-input" placeholder="Ingrese su Usuario"
        value={username} onChange={(e) => setusername(e.target.value)} required />
      <input type="password" className="login-input" placeholder="Contraseña"
        value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit" className="login-button">Ingresar</button>
    </form>
  );
};

export default Login;
