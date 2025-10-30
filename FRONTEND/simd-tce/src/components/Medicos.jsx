import React, { useEffect, useState } from 'react';
import './style/medicos.css';
import { FaEdit, FaTrash, FaPlusCircle, FaSearch, FaCheckCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

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
        rol_id: '',
        rol_nombre: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [usernameError, setUsernameError] = useState('');
    const [dniError, setDniError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // 📌 Cargar médicos
    const fetchMedicos = () => {
        setLoading(true);
        fetch('https://simd-tce.duckdns.org/api/medicos')
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

    // 📌 Cargar roles
    const fetchRoles = () => {
        fetch('https://simd-tce.duckdns.org/api/roles')
            .then(res => res.json())
            .then(data => setRoles(data))
            .catch(err => console.log(err));
    };

    useEffect(() => {
        fetchRoles();
        fetchMedicos();
    }, []);

    // 📋 Manejo de cambios en inputs + validaciones
    const handleChange = (e) => {
        const { name, value } = e.target;

        // ✅ Forzar username a minúsculas
        if (name === "username") {
            setForm({ ...form, [name]: value.toLowerCase() });
            return;
        }

        setForm({ ...form, [name]: value });

        // ✅ Validar contraseña mínima de 8 caracteres
        if (name === "password") {
            if (value.length > 0 && value.length < 8) {
                setPasswordError("La contraseña debe tener al menos 8 caracteres");
            } else {
                setPasswordError("");
            }
        }
    };

    // Validaciones en tiempo real para username y DNI
    useEffect(() => {
        if (!form.username.trim()) { setUsernameError(''); return; }
        const usuarioExistente = medicos.find(m => m.username.toLowerCase() === form.username.toLowerCase() && m.id !== form.id);
        setUsernameError(usuarioExistente ? `El usuario "${form.username}" ya existe` : '');
    }, [form.username, medicos, form.id]);

    useEffect(() => {
        if (!form.dni.trim()) { setDniError(''); return; }
        const dniExistente = medicos.find(m => m.dni === form.dni && m.id !== form.id);
        setDniError(dniExistente ? `El DNI "${form.dni}" ya existe` : '');
    }, [form.dni, medicos, form.id]);

    // Filtrado y orden: activos primero, inactivos al final
    const filteredMedicos = medicos
        .filter(m =>
            m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.estado === b.estado ? 0 : (a.estado === 'Activo' ? -1 : 1));

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const openModal = (medico = null) => {
        if (medico) {
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
                rol_id: '',
                rol_nombre: ''
            });
        }
        setPasswordError('');
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    // Registrar o editar médico
    const handleSubmit = (e) => {
        e.preventDefault();
        if (usernameError || dniError || passwordError) return;

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id
            ? `https://simd-tce.duckdns.org/api/medicos/editar/${form.id}`
            : 'https://simd-tce.duckdns.org/api/medicos/registrar';

        const token = localStorage.getItem('token');

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                Swal.fire({
                    title: form.id ? '✅ Médico actualizado' : '🎉 Médico registrado',
                    text: data.message || 'Operación realizada',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                fetchMedicos();
                closeModal();
            })
            .catch(err => Swal.fire('❌ Error', err.message, 'error'));
    };

    // Activar/Inactivar usuario con confirmación
    const handleToggleEstado = (medico) => {
        const nuevoEstado = medico.estado === 'Activo' ? 'Inactivo' : 'Activo';
        Swal.fire({
            title: `¿Deseas ${nuevoEstado === 'Activo' ? 'activar' : 'inactivar'} al usuario ${medico.username}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                fetch(`https://simd-tce.duckdns.org/api/medicos/estado/${medico.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                })
                    .then(res => res.json())
                    .then(data => {
                        Swal.fire('¡Listo!', data.message, 'success');
                        fetchMedicos();
                    })
                    .catch(err => Swal.fire('Error', err.message, 'error'));
            }
        });
    };

    if (loading) return <p style={{ textAlign: 'center' }}>Cargando médicos...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

    return (
        <div className="medicos-container">
            <h1>Módulo de Médicos</h1>

            <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Buscar por usuario..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ padding: '10px', fontSize: '16px', width: '300px' }}
                />
                <FaSearch style={{ position: 'absolute', marginLeft: '-25px', marginTop: '10px', color: '#999' }} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button className="btn-primary" onClick={() => openModal()} style={{ padding: '10px 20px' }}>
                    <FaPlusCircle /> Crear Médico
                </button>
            </div>

            <h2 style={{ marginTop: '30px', textAlign: 'center' }}>Listado de Médicos</h2>
            {searchTerm && filteredMedicos.length === 0 && <p>No se encontraron médicos con ese criterio</p>}

            <table className='roles-table'>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>DNI</th>
                        <th>Nombre</th>
                        <th>Especialidad</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMedicos.map(m => (
                        <tr
                            key={m.id}
                            style={{
                                backgroundColor: m.estado === 'Inactivo' ? '#f8d7da' : 'transparent'
                            }}
                        >
                            <td>{m.username}</td>
                            <td>{m.dni}</td>
                            <td>{m.nombre}</td>
                            <td>{m.especialidad}</td>
                            <td>{m.rol_nombre}</td>
                            <td>{m.estado}</td>
                            <td>
                                <FaEdit
                                    onClick={() => openModal(m)}
                                    style={{ cursor: 'pointer', color: 'orange', marginRight: '10px' }}
                                />
                                {m.estado === 'Activo' ? (
                                    <FaTrash
                                        onClick={() => handleToggleEstado(m)}
                                        style={{ cursor: 'pointer', color: 'red' }}
                                        title="Inactivar usuario"
                                    />
                                ) : (
                                    <FaCheckCircle
                                        onClick={() => handleToggleEstado(m)}
                                        style={{ cursor: 'pointer', color: 'green' }}
                                        title="Activar usuario"
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>{form.id ? 'Editar Médico' : 'Crear Médico'}</h2>

                        <form onSubmit={handleSubmit} className="medico-form">
                            {/* Nombre y DNI */}
                            <div className="form-row">
                                <label>
                                    Nombre completo:
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </label>
                                <label>
                                    DNI:
                                    <input
                                        type="text"
                                        name="dni"
                                        value={form.dni}
                                        maxLength="13"
                                        pattern="\d{13}"
                                        title="El DNI debe tener exactamente 13 dígitos numéricos"
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            setForm({ ...form, dni: value });
                                            if (value.length === 13) setDniError("");
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value.length !== 13) {
                                                setDniError("El DNI debe tener exactamente 13 dígitos");
                                            } else {
                                                setDniError("");
                                            }
                                        }}
                                        required
                                        readOnly={!!form.id}
                                    />
                                </label>
                                {dniError && <p style={{ color: 'red', fontSize: '12px' }}>{dniError}</p>}
                            </div>

                            {/* Correo y Teléfono */}
                            <div className="form-row">
                                <label>
                                    Correo:
                                    <input type="email" name="correo" value={form.correo} onChange={handleChange} />
                                </label>
                                <label>
                                    Teléfono:
                                    <input type="number" name="telefono" value={form.telefono} onChange={handleChange} />
                                </label>
                            </div>

                            {/* Dirección y Especialidad */}
                            <div className="form-row">
                                <label>
                                    Dirección:
                                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange} />
                                </label>
                                <label>
                                    Especialidad:
                                    <select
                                        name="especialidad"
                                        value={form.especialidad}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione especialidad médica</option>
                                        <option value="neurología">Neurología</option>
                                        <option value="neurocirugía">Neurocirugía</option>
                                        <option value="fisiatría">Fisiatría</option>
                                        <option value="geriatría">Geriatría</option>
                                        <option value="pediatría">Pediatría</option>
                                        <option value="urgencias">Urgencias</option>
                                        <option value="cuidados intensivos">Cuidados Intensivos (UCI)</option>
                                        <option value="quirófano">Quirófano</option>
                                        <option value="traumatología">Traumatología</option>
                                        <option value="oncología">Oncología</option>
                                        <option value="salud mental">Salud Mental</option>
                                    </select>
                                </label>
                            </div>

                            {/* Colegiado y Horario */}
                            <div className="form-row">
                                <label>
                                    Colegiado:
                                    <input type="text" name="colegiado" value={form.colegiado} onChange={handleChange} />
                                </label>
                                <label>
                                    Horario:
                                    <select
                                        name="horario"
                                        value={form.horario}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione un horario</option>
                                        <option value="lun-vie-8-17">Lunes a Viernes (08:00 - 17:00)</option>
                                        <option value="lun-sab-7-13">Lunes a Sábado (07:00 - 13:00)</option>
                                        <option value="lun-mie-vie-13-19">Lunes, Miércoles y Viernes (13:00 - 19:00)</option>
                                        <option value="fin-semana-noche">Sábado y Domingo (19:00 - 07:00)</option>
                                        <option value="turno-rotativo">Turno Rotativo</option>
                                        <option value="noche-fijo">Turno Nocturno Fijo (19:00 - 07:00)</option>
                                        <option value="medio-turno-tarde">Lunes a Viernes (Medio Turno - 13:00 a 17:00)</option>
                                    </select>
                                </label>
                            </div>

                            {/* Username y Contraseña */}
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
                                {usernameError && <p style={{ color: 'red', fontSize: '12px' }}>{usernameError}</p>}

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
                                {passwordError && <p style={{ color: 'red', fontSize: '12px' }}>{passwordError}</p>}
                            </div>

                            {/* Estado y Rol */}
                            <div className="form-row">
                                <label>
                                    Estado:
                                    <select name="estado" value={form.estado} onChange={handleChange} required>
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </label>

                                <label>
                                    Rol:
                                    <select name="rol_id" value={form.rol_id} onChange={handleChange} required disabled={!!form.id}>
                                        <option value="">Seleccione Rol</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.nombre}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <button type="submit" disabled={usernameError || dniError || passwordError}>
                                {form.id ? 'Guardar Cambios' : 'Registrar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicos;
