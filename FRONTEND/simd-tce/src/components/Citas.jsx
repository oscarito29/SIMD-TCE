import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import './style/citas.css';

const CrearCita = () => {
    const [form, setForm] = useState({
        paciente_id: "",
        medico_id: "",
        especialidad: "",
        fecha: "",
        hora: "",
        motivo: ""
    });

    const [pacientes, setPacientes] = useState([]);
    const [medicos, setMedicos] = useState([]);

    useEffect(() => {
        fetch("https://simd-tce.duckdns.org/api/pacientes")
            .then(res => res.json())
            .then(data => setPacientes(data));

        fetch("https://simd-tce.duckdns.org/api/usuarios/medicos")
            .then(res => res.json())
            .then(data => setMedicos(data));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "medico_id") {
            const medicoSeleccionado = medicos.find(m => m.id === parseInt(value));
            setForm({
                ...form,
                medico_id: value,
                especialidad: medicoSeleccionado ? medicoSeleccionado.especialidad : ""
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    /* const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("https://simd-tce.duckdns.org/api/citas/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: data.message
                });

                // Limpiar formulario
                setForm({
                    paciente_id: "",
                    medico_id: "",
                    especialidad: "",
                    fecha: "",
                    hora: "",
                    motivo: ""
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: err.message
            });
        }
    }; */


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            /* const res = await fetch("https://simd-tce.duckdns.org/api/citas/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            }); */
            const token = localStorage.getItem("token");
            const res = await fetch("https://simd-tce.duckdns.org/api/citas/crear", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // 🔹 importante
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                // Si el backend devuelve 400, mostramos mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message
                });
            } else {
                // Si se crea la cita correctamente
                Swal.fire({
                    icon: 'success',
                    title: 'Cita creada',
                    text: data.message
                });

                // Limpiar formulario
                setForm({
                    paciente_id: "",
                    medico_id: "",
                    especialidad: "",
                    fecha: "",
                    hora: "",
                    motivo: ""
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: err.message
            });
        }
    };

    return (
        <div>
            <h1 className="crear-cita-title" style={{ marginTop: "20px" }}>
                Agendar Nueva Cita
            </h1>


            <form className="crear-cita-form" onSubmit={handleSubmit}>
                <select name="paciente_id" onChange={handleChange} value={form.paciente_id} required>
                    <option value="">Seleccionar Paciente (DNI)</option>
                    {pacientes.map(p => (
                        <option key={p.dni} value={p.dni}>{p.nombre} - {p.dni}</option>
                    ))}
                </select>

                <select name="medico_id" onChange={handleChange} value={form.medico_id} required>
                    <option value="">Seleccionar Médico</option>
                    {medicos.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
                    ))}
                </select>

                <input type="text" name="especialidad" placeholder="Especialidad" value={form.especialidad} readOnly required />
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
                <textarea name="motivo" placeholder="Motivo" value={form.motivo} onChange={handleChange}></textarea>
                <input type="time" name="hora" value={form.hora} onChange={handleChange} required />

                {/* Contenedor del botón */}
                <div className="submit-container">
                    <button type="submit" className="btn-primary">Agendar Cita</button>
                </div>
            </form>
        </div>
    );
};

export default CrearCita;
