import React, { useEffect, useState } from 'react';
import './style/medicos.css';
import { FaEdit, FaTrash, FaPlusCircle, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Medicos = () => {
    const [medicos, setMedicos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState({
        id: '',
        nombre: '',
        dni: '',
        correo: '',
        telefono: '',
        direccion: '',
        especialidad: '',
        colegiado: '',
        horario: '',
        username: '',
        password: '',
        estado: 'Activo',
        rol_id: '',  // Asegúrate de tener el rol_id
        rol_nombre: ''  // Aquí manejamos el nombre del rol
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Controlar el estado del modal

    // Cargar médicos
    const fetchMedicos = () => {
        setLoading(true);
        fetch('http://localhost:5000/api/medicos')
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
        fetch('http://localhost:5000/api/roles')
            .then(res => res.json())
            .then(data => setRoles(data))
            .catch(err => console.log(err));
    };

    // Usar useEffect para cargar roles y médicos
    useEffect(() => {
        fetchRoles();
        fetchMedicos();
    }, []);

    // Manejo de cambios en el formulario
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const filteredMedicos = medicos.filter(m => {
        return (
            m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Manejo de la búsqueda
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Abrir el modal para crear o editar
    const openModal = (medico = null) => {
        if (medico) {
            // Llenar el formulario con los datos del médico cuando se edita
            /* setForm({
                id: medico.id,
                nombre: medico.nombre,
                dni: medico.dni,
                correo: medico.correo,
                telefono: medico.telefono,
                direccion: medico.direccion,
                especialidad: medico.especialidad,
                colegiado: medico.colegiado,
                horario: medico.horario,
                username: medico.username,
                password: '',  // No mostrar la contraseña al editar
                estado: medico.estado,
                rol_id: medico.rol_id,  // Asignar correctamente el rol_id
                rol_nombre: medico.rol_nombre  // Usar rol_nombre si lo necesitas
            }); */

            setForm({
                id: medico.id,
                nombre: medico.nombre || '',
                dni: medico.dni || '',
                correo: medico.correo || '',
                telefono: medico.telefono || '',
                direccion: medico.direccion || '',
                especialidad: medico.especialidad || '',
                colegiado: medico.colegiado || '',
                horario: medico.horario || '',
                username: medico.username || '',
                password: medico.username || '',
                estado: medico.estado || 'Activo',
                rol_id: medico.rol_id || '',
                rol_nombre: medico.rol_nombre || ''
            });
        } else {
            // Limpiar el formulario si estamos creando un nuevo médico
            setForm({
                id: '',
                nombre: '',
                dni: '',
                correo: '',
                telefono: '',
                direccion: '',
                especialidad: '',
                colegiado: '',
                horario: '',
                username: '',
                password: '',
                estado: 'Activo',
                rol_id: '',  // Limpiar el rol_id cuando estamos creando
                rol_nombre: ''
            });


        }
        setIsModalOpen(true);
    };

    // Cerrar el modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Manejo de la solicitud de creación o actualización
    /* const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Formulario que se va a enviar:', form); // Depurar el formulario

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `http://localhost:5000/api/medicos/editar/${form.id}` : 'http://localhost:5000/api/medicos/registrar';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                setMessage(data.message);
                fetchMedicos();  // Refrescar la lista de médicos
                closeModal(); // Cerrar el modal después de guardar
            })
            .catch(err => setError(err.message));
    }; */

    /* const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('Formulario que se va a enviar:', form); // Depurar el formulario

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `http://localhost:5000/api/medicos/editar/${form.id}` : 'http://localhost:5000/api/medicos/registrar';

        console.log("URL que se va a utilizar:", url); // Verifica la URL generada

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                console.log('Respuesta de la API:', data); // Verifica la respuesta de la API
                setMessage(data.message);
                fetchMedicos();  // Refrescar la lista de médicos
                closeModal(); // Cerrar el modal después de guardar
            })
            .catch(err => {
                console.error("Error:", err); // Asegúrate de capturar cualquier error
                setError(err.message);
            });
    }; */


    const handleSubmit = (e) => {
        e.preventDefault();

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id
            ? `http://localhost:5000/api/medicos/editar/${form.id}`
            : 'http://localhost:5000/api/medicos/registrar';

        /*  fetch(url, {
             method,
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(form)
         }) */

        const token = localStorage.getItem('token'); // Obtenemos el token

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token   // ✅ Aquí va el token
            },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    Swal.fire({
                        title: form.id ? '✅ Médico actualizado' : '🎉 Médico registrado',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    });

                    fetchMedicos();   // refrescar lista
                    closeModal();     // cerrar modal
                } else {
                    Swal.fire({
                        title: '⚠️ Error',
                        text: 'Ocurrió un problema en el servidor',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                }
            })
            .catch(err => {
                Swal.fire({
                    title: '❌ Error',
                    text: err.message,
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            });
    };


    // Función para eliminar un médico
    const handleDelete = (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este médico?")) {
            fetch(`http://localhost:5000/api/medicos/eliminar/${id}`, {
                method: 'DELETE',
            })
                .then(res => res.json())
                .then(data => {
                    setMessage(data.message);
                    fetchMedicos();  // Refrescar la lista de médicos
                })
                .catch(err => setError(err.message));
        }
    };

    // Verificación de los valores del formulario (para depurar)
    // console.log("Formulario actual:", form);

    if (loading) return <p style={{ textAlign: 'center' }}>Cargando médicos...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

    return (
        <div className="medicos-container">
            <h1 className="medicos-title">Módulo de Médicos</h1>

            {/* Campo de búsqueda */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Buscar por usuario..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ padding: '10px', fontSize: '16px', width: '300px' }}
                />
                <FaSearch style={{ position: 'absolute', marginLeft: '-25px', marginTop: '-7px', color: '#999' }} />
            </div>

            {/* Icono para Crear Médico */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button className="btn-primary"
                    onClick={() => openModal()}
                    style={{ padding: '10px 20px' }}
                >
                    <FaPlusCircle /> Crear Médico
                </button>
            </div>

            {/* Tabla de médicos */}
            {/* <h2 style={{ marginTop: '30px', textAlign: 'center' }}>Listado de Médicos</h2>
            <table className="medicos-table" style={{textAlign: 'left'}}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Especialidad</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMedicos.map(m => (
                        <tr key={m.id}>
                            <td>{m.id}</td>
                            <td>{m.nombre}</td>
                            <td>{m.username}</td>
                            <td>{m.especialidad}</td>
                            <td>{m.rol_nombre}</td>
                            <td>
                                <FaEdit
                                    onClick={() => openModal(m)}
                                    style={{ cursor: 'pointer', color: 'orange', marginRight: '10px' }}
                                />
                                <FaTrash
                                    onClick={() => handleDelete(m.id)}
                                    style={{ cursor: 'pointer', color: 'red' }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> */}

            {/* Tabla de médicos */}
            <h2 style={{ marginTop: '30px', textAlign: 'center' }}>Listado de Médicos</h2>

            {searchTerm ? (
                filteredMedicos.length > 0 ? (
                    <table className="medicos-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Usuario</th>
                                <th>Especialidad</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicos.map(m => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>{m.nombre}</td>
                                    <td>{m.username}</td>
                                    <td>{m.especialidad}</td>
                                    <td>{m.rol_nombre}</td>
                                    <td>
                                        <FaEdit
                                            onClick={() => openModal(m)}
                                            style={{ cursor: 'pointer', color: 'orange', marginRight: '10px' }}
                                        />
                                        <FaTrash
                                            onClick={() => handleDelete(m.id)}
                                            style={{ cursor: 'pointer', color: 'red' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        No se encontraron médicos con ese criterio
                    </p>
                )
            ) : (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    Escriba en la búsqueda para ver resultados
                </p>
            )}


            {/* Modal de Crear/Editar */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>{form.id ? 'Editar Médico' : 'Crear Médico'}</h2>


                        <form onSubmit={handleSubmit} className="medico-form">
                            <div className="form-row">
                                {/*  <label>
                                    Nombre completo:
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </label> */}
                                <label>
                                    Nombre completo:
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={(e) =>
                                            setForm({ ...form, nombre: e.target.value.toUpperCase() })
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    DNI:
                                    <input
                                        type="text"
                                        name="dni"
                                        value={form.dni}
                                        onChange={handleChange}
                                        required
                                        readOnly={form.id ? true : false}
                                    />
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Correo:
                                    <input
                                        type="email"
                                        name="correo"
                                        value={form.correo}
                                        onChange={handleChange}
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
                            </div>

                            <div className="form-row">
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
                                        required
                                    />
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Colegiado:
                                    <input
                                        type="text"
                                        name="colegiado"
                                        value={form.colegiado}
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
                            </div>

                            <div className="form-row">
                                <label>
                                    Usuario:
                                    <input
                                        type="text"
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        required
                                        disabled={!!form.id}
                                    />
                                </label>
                                {/* {!form.id && (
                                    <label>
                                        Contraseña:
                                        <input
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                )} */}

                                <label>
                                    Contraseña:
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Estado:
                                    <select
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </label>


                                <label>
                                    Rol:
                                    <select
                                        name="rol_id"
                                        value={form.rol_id}
                                        onChange={handleChange}
                                        required
                                        disabled={!!form.id}
                                    >
                                        <option value="">Seleccione Rol</option>

                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <button type="submit">{form.id ? 'Guardar Cambios' : 'Registrar'}</button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicos;
