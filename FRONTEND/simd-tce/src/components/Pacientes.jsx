import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlusCircle, FaSearch, FaCheckCircle, FaEye } from 'react-icons/fa';
import Swal from "sweetalert2";
import './style/pacientes.css';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pacienteEditando, setPacienteEditando] = useState(null); // 👈 Modal
  const [showModal, setShowModal] = useState(false); // 👈 Mostrar/Ocultar Modal
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const rol = localStorage.getItem("rol");

  // Mostrar el botón solo si el rol está permitido
  const puedeEditar = ["Administrador", "Recepción"].includes(rol);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = () => {
    const token = localStorage.getItem("token");

    fetch('https://simd-tce.duckdns.org/api/pacientes', {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error('Error al cargar pacientes');
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
  };
  const closeModal = () => setShowModal(false);


  const handleEditarClick = (paciente) => {
    setPacienteEditando({ ...paciente }); // Copia del paciente
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setPacienteEditando(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarCambios = () => {
    const token = localStorage.getItem("token");

    fetch(`https://simd-tce.duckdns.org/api/pacientes/editar/${pacienteEditando.dni}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(pacienteEditando),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar paciente');
        return res.json();
      })
      /* .then(() => {
        setShowModal(false);
        fetchPacientes(); // Refrescar lista
      }) */

      .then(() => {
        setShowModal(false);
        fetchPacientes(); // Refrescar lista

        Swal.fire({
          title: '¡Paciente actualizado!',
          text: 'Los datos fueron guardados correctamente.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
        });
      })
      .catch(err => {
        alert('Error al guardar cambios');
        console.error(err);
      });
  };

  const pacientesFiltrados = pacientes.filter(p =>
    p.dni.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando pacientes...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div className="pacientes-wrapper">
      <h1 style={{ textAlign: 'center' }}>Listado de Pacientes</h1>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por DNI o Nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
      </div>

      <table className='roles-table'>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Sexo</th>
            <th>Diagnóstico</th>
            <th>Fecha Ingreso</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientesFiltrados.map((p, i) => (
            <tr key={i}>
              <td>{p.dni}</td>
              <td>{p.nombre}</td>
              <td>{p.edad}</td>
              <td>{p.sexo}</td>
              <td>{p.diagnostico_inicial}</td>
              <td>{p.fecha_ingreso || '-'}</td>
              <td>{p.estado_actual}</td>
              <td>
                {/* <button
                  className="btn-primary"
                  style={{ fontSize: '10px' }}
                  onClick={() => navigate(`/pacientes/historial/${p.dni}`)}
                >
                  Ver Historial
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '10px', marginLeft: '5px' }}
                  onClick={() => handleEditarClick(p)}
                >
                  Editar
                </button> */}
                {/* <button
                  className="btn-primary"
                  title="Ver Historial"
                  onClick={() => navigate(`/pacientes/historial/${p.dni}`)}
                >
                  <FaEye style={{ fontSize: '10px' }} />
                </button> */}

                {/* <button
                  className="btn-secondary"
                  title="Editar Paciente"
                  onClick={() => handleEditarClick(p)}
                  style={{ marginLeft: '5px' }}
                >
                  <FaEdit 
                  onClick={() => handleEditarClick(p)}
                  style={{ cursor: 'pointer', color: 'orange', marginRight: '10px' }}
                  />
                </button> */}

                <FaEye style={{ cursor: 'pointer', color: 'blue', marginRight: '10px' }}
                  title='Ver Historial'
                  onClick={() => navigate(`/pacientes/historial/${p.dni}`)}
                />

                {/*  <FaEdit 
                  onClick={() => handleEditarClick(p)}
                  title='Editar Paciente'
                  style={{ cursor: 'pointer', color: 'orange', marginRight: '10px' }}
                  /> */}

                <FaEdit
                  onClick={puedeEditar ? () => handleEditarClick(p) : undefined} // no hace nada si no puede
                  title={puedeEditar ? "Editar Paciente" : "No tiene permiso"}
                  style={{
                    cursor: puedeEditar ? "pointer" : "not-allowed",
                    color: puedeEditar ? "orange" : "gray",
                    marginRight: "10px"
                  }}
                />

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Edición */}
      {/*  {showModal && pacienteEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Paciente</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleGuardarCambios(); }}>
              <label>Nombre:</label>
              <input name="nombre" value={pacienteEditando.nombre} onChange={handleModalChange} />
              <label>Edad:</label>
              <input name="edad" type="number" value={pacienteEditando.edad} onChange={handleModalChange} />
              <label>Sexo:</label>
              <input name="sexo" value={pacienteEditando.sexo} onChange={handleModalChange} />
              <label>Diagnóstico:</label>
              <input name="diagnostico_inicial" value={pacienteEditando.diagnostico_inicial} onChange={handleModalChange} />
              <label>Estado:</label>
              <input name="estado_actual" value={pacienteEditando.estado_actual} onChange={handleModalChange} />
              <div style={{ marginTop: '10px' }}>
                <button type="submit" className="btn-primary">Guardar</button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {/* Modal de Edición */}
      {showModal && pacienteEditando && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Editar Paciente</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleGuardarCambios(); }} className="medico-form">



              <div className="form-row">
                <label>DNI:</label>
                <input name="dni" value={pacienteEditando.dni} readOnly />

                <label>Nombre:</label>
                {/* <input name="nombre" value={pacienteEditando.nombre || ''} onChange={handleModalChange} /> */}
                <input
                  name="nombre"
                  value={pacienteEditando.nombre || ''}
                  style={{ textTransform: 'uppercase' }} // 👈 OPCIONAL
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase();
                    setPacienteEditando(prev => ({ ...prev, nombre: upper }));
                  }}
                />
              </div>

              <div className="form-row">
                <label>Fecha de Nacimiento:</label>
                <input
                  name="fecha_nacimiento"
                  type="date"
                  value={pacienteEditando.fecha_nacimiento || ''}
                  onChange={handleModalChange}
                />
                <label>Edad:</label>
                <input
                  name="edad"
                  type="number"
                  value={pacienteEditando.edad || ''}
                  onChange={handleModalChange}
                /></div>

              <div className="form-row">
                <label>Sexo:</label>
                <select name="sexo" value={pacienteEditando.sexo || ''} onChange={handleModalChange}>
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>

                <label>Lugar de Procedencia:</label>
                <input
                  name="lugar_procedencia"
                  value={pacienteEditando.lugar_procedencia || ''}
                  onChange={handleModalChange}
                />
              </div>

              <div className="form-row">
                <label>Diagnóstico Inicial:</label>
                <input
                  name="diagnostico_inicial"
                  value={pacienteEditando.diagnostico_inicial || ''}
                  onChange={handleModalChange}
                />

                <label>Estado Actual:</label>
                <input
                  name="estado_actual"
                  value={pacienteEditando.estado_actual || ''}
                  onChange={handleModalChange}
                />
              </div>

              {/*  <div className="form-row">
                <label>Médico Responsable:</label>
                <input
                  name="medico_responsable"
                  value={pacienteEditando.medico_responsable || ''}
                  onChange={handleModalChange}
                />


              </div> */}

              <div className="form-row">
                <label>Fecha Ingreso:</label>
                <input
                  name="fecha_ingreso"
                  // type="datetime-local"
                  type="date"
                  value={pacienteEditando.fecha_ingreso ? pacienteEditando.fecha_ingreso.replace(' ', 'T') : ''}
                  readOnly
                />
              </div>


              <button type="submit" className="btn-primary">Guardar</button>
              {/* <button
                type="button"
                className="btn-secondary"
                style={{ marginLeft: '10px' }}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button> */}




              {/*  <label>Fecha Salida:</label>
              <input
                name="fecha_salida"
                type="datetime-local"
                value={pacienteEditando.fecha_salida ? pacienteEditando.fecha_salida.replace(' ', 'T') : ''}
                onChange={handleModalChange}
              /> */}

              {/* <div style={{ marginTop: '10px' }}>
                <button type="submit" className="btn-primary">Guardar</button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div> */}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pacientes;
