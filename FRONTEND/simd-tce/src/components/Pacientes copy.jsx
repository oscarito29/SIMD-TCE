/* 
import React from 'react';
import './style/pacientes.css';

const Pacientes = () => {
  return (
    <div>
      <h1 style={{textAlign: 'center'}}>Listado de Pacientes</h1>
    </div>
  );
};

export default Pacientes;
 */

// src/components/Pacientes.jsx
import React, { useEffect, useState } from 'react';
import './style/pacientes.css';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/pacientes')  // Ajusta puerto si usas otro
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar pacientes');
        }
        return response.json();
      })
      .then(data => {
        setPacientes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{textAlign: 'center'}}>Cargando pacientes...</p>;
  if (error) return <p style={{color: '                red', textAlign: 'center'}}>{error}</p>;

  return (
   /*  <div style={{marginLeft: '250px'}}>
      <h1 style={{textAlign: 'center'}}>Listado de Pacientes</h1>
      <table className="pacientes-table" >
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Lugar de Procedencia</th>
            <th>Diagnóstico Inicial</th>
            <th>Sexo</th>
            <th>Fecha Ingreso</th>
            <th>Fecha Salida</th>
            <th>Estado Actual</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.dni}>
              <td>{p.dni}</td>
              <td>{p.nombre}</td>
              <td>{p.edad}</td>
              <td>{p.lugar_procedencia}</td>
              <td>{p.diagnostico_inicial}</td>
              <td>{p.sexo}</td>
              <td>{p.fecha_ingreso || '-'}</td>
              <td>{p.fecha_salida || '-'}</td>
              <td>{p.estado_actual}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div> */

    <div className="pacientes-table-container">
  <table className="pacientes-table">
    <thead>
      <tr>
        <th>DNI</th>
        <th>Nombre</th>
        <th>Edad</th>
        <th>Sexo</th>
        <th>Diagnóstico</th>
        <th>Fecha Ingreso</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      {pacientes.map((p, i) => (
        <tr key={i}>
          <td>{p.dni}</td>
          <td>{p.nombre}</td>
          <td>{p.edad}</td>
          <td>{p.sexo}</td>
          <td>{p.diagnostico_inicial}</td>
          <td>{p.fecha_ingreso}</td>
          <td>{p.estado_actual}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default Pacientes;
