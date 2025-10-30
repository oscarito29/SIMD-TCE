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
/* 
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Pacientes from "./components/Pacientes";
import RegistrarPaciente from "./components/RegistrarPaciente";
import HistorialPaciente from "./components/HistorialPaciente";
import Citas from "./components/Citas";
import ReportesPacientes from "./components/ReportesPacientes";
import Monitoreo from "./components/Monitoreo";
import Reportes from "./components/Reportes";
import Configuracion from "./components/Configuracion";
import Medicos from "./components/Medicos";
import Roles from "./components/Roles";
import Parametros from "./components/Parametros";
import Perfil from "./components/Perfil";
import Password from "./components/Password";
import Bitacora from "./components/Bitacora";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/pacientes/registrar" element={<RegistrarPaciente />} />
            <Route path="/pacientes/historial/:dni" element={<HistorialPaciente />} />
            <Route path="/pacientes/citas" element={<Citas />} />
            <Route path="/pacientes/reportes" element={<ReportesPacientes />} />
            <Route path="/monitoreo" element={<Monitoreo />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/cambiar-password" element={<Password />} />

           
            <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
              <Route path="/configuracion/medicos" element={<Medicos />} />
              <Route path="/configuracion/roles" element={<Roles />} />
              <Route path="/configuracion/parametros" element={<Parametros />} />
              <Route path="/configuracion/bitacora" element={<Bitacora />} />
            </Route>
          </Route>
        </Route>

       
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
*/



// App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Pacientes from "./components/Pacientes";
import RegistrarPaciente from "./components/RegistrarPaciente";
import HistorialPaciente from "./components/HistorialPaciente";
import Citas from "./components/Citas";
import ReportesPacientes from "./components/ReportesPacientes";
import Monitoreo from "./components/Monitoreo";
import Reportes from "./components/Reportes";
import Medicos from "./components/Medicos";
import Roles from "./components/Roles";
import Parametros from "./components/Parametros";
import Bitacora from "./components/Bitacora";
import Perfil from "./components/Perfil";
import Password from "./components/Password";

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/registrar" element={<RegistrarPaciente />} />
          <Route path="/pacientes/historial/:dni" element={<HistorialPaciente />} />
          <Route path="/pacientes/citas" element={<Citas />} />
          <Route path="/pacientes/reportes" element={<ReportesPacientes />} />
          <Route path="/monitoreo" element={<Monitoreo />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/cambiar-password" element={<Password />} />
          <Route path="/configuracion/medicos" element={<Medicos />} />
          <Route path="/configuracion/roles" element={<Roles />} />
          <Route path="/configuracion/parametros" element={<Parametros />} />
          <Route path="/configuracion/bitacora" element={<Bitacora />} />
        </Route>

        {/* Cualquier ruta que no exista */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
