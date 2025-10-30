/* import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
 */
/* import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout"; 
import Dashboard from "./components/Dashboard"; 
import Pacientes from "./components/Pacientes"; 

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App; */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout"; 
import Dashboard from "./components/Dashboard"; 
import Pacientes from "./components/Pacientes"; 
import Login from "./components/Login";
import Monitoreo from "./components/Monitoreo";
import Reportes from "./components/Reportes";
import Configuracion from "./components/Configuracion";
import Medicos from "./components/Medicos";
import Roles from "./components/Roles";
import Parametros from "./components/Parametros";
import Perfil from "./components/Perfil";
import Password from "./components/Password";
import RegistrarPaciente from "./components/RegistrarPaciente";
import HistorialPaciente from "./components/HistorialPaciente";
import Citas from "./components/Citas";
import ReportesPacientes from "./components/ReportesPacientes";

// Componente para rutas protegidas
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) {
    // No está logueado
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(rol)) {
    // No tiene permisos
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir al login si no está logueado */}
        <Route 
          path="/" 
          element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />

        {/* Login: solo accesible si no está logueado */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" /> : <Login />} 
        />

        {/* Rutas protegidas dentro del Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route path="" element={<Dashboard />} />
          </Route>

          {/* Pacientes: accesible a todos los roles logueados */}
          <Route element={<ProtectedRoute />}>
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/pacientes/registrar" element={<RegistrarPaciente />} />
            <Route path="/pacientes/historial/:dni" element={<HistorialPaciente />} />
            <Route path="/pacientes/citas" element={<Citas />} />
            <Route path="/pacientes/reportes" element={<ReportesPacientes />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/monitoreo" element={<Monitoreo />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/cambiar-password" element={<Password />} />
          </Route>

          {/* Configuración: solo roles Admin */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/configuracion/medicos" element={<Medicos />} />
            <Route path="/configuracion/roles" element={<Roles />} />
            <Route path="/configuracion/parametros" element={<Parametros />} />
          </Route>

        </Route>

        {/* Ruta catch-all: redirige al dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;








