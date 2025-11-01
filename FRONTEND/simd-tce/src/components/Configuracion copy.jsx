import React, { useEffect, useState } from 'react';
import './style/medicos.css'; // Crea tu CSS similar al de pacientes

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    username: '',
    password: '',
    especialidad: '',
    rol_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Cargar médicos
  const fetchMedicos = () => {
    setLoading(true);
    fetch('http://localhost:5000//api/medicos') // Ajusta endpoint
      .then(res => res.json())
      .then(data => {
        setMedicos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Cargar roles
  const fetchRoles = () => {
    fetch('http://localhost:5000//api/roles') // Endpoint que devuelve roles
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchMedicos();
    fetchRoles();
  }, []);

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  // Registrar nuevo médico
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000//api/medicos/registrar', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form)
    })
    .then(res => res.json())
    .then(data => {
      setMessage(data.message);
      setForm({nombre: '', username: '', password: '', especialidad: '', rol_id: ''});
      fetchMedicos(); // Refrescar tabla
    })
    .catch(err => setError(err.message));
  };

  if (loading) return <p style={{textAlign: 'center'}}>Cargando médicos...</p>;
  if (error) return <p style={{color: 'red', textAlign: 'center'}}>{error}</p>;

  return (
    <div style={{marginLeft: '250px'}}>
      <h1 style={{textAlign: 'center'}}>Módulo de Médicos</h1>

      {/* Formulario de registro */}
      <form onSubmit={handleSubmit} className="medicos-form">
        <h2>Registrar Médico</h2>
        <input type="text" name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} required />
        <input type="text" name="username" placeholder="Usuario" value={form.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
        <input type="text" name="especialidad" placeholder="Especialidad" value={form.especialidad} onChange={handleChange} required />
        <select name="rol_id" value={form.rol_id} onChange={handleChange} required>
          <option value="">Seleccione Rol</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
        <button type="submit">Registrar</button>
        {message && <p style={{color: 'green'}}>{message}</p>}
      </form>

      {/* Tabla de médicos */}
      <h2 style={{marginTop: '30px', textAlign: 'center'}}>Listado de Médicos</h2>
      <table className="medicos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Especialidad</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {medicos.map(m => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.nombre}</td>
              <td>{m.username}</td>
              <td>{m.especialidad}</td>
              <td>{m.rol_nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Medicos;
