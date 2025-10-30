import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";


import "./style/bitacora.css";
dayjs.extend(utc);

const Bitacora = () => {
    const hoy = new Date().toISOString().split("T")[0];

    const [usuario, setUsuario] = useState("");
    const [tipoAccion, setTipoAccion] = useState("");
    const [desde, setDesde] = useState(hoy);
    const [hasta, setHasta] = useState(hoy);
    const [registros, setRegistros] = useState([]);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [accionesDisponibles, setAccionesDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState(false); // false al inicio

    // --- Cargar siempre todas las opciones disponibles al iniciar ---
    useEffect(() => {
        const cargarOpciones = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/bitacora");
                const data = await res.json();
                setUsuariosDisponibles(Array.isArray(data.usuarios) ? data.usuarios : []);
                setAccionesDisponibles(Array.isArray(data.acciones) ? data.acciones : []);
            } catch (error) {
                console.error("Error al cargar opciones:", error);
                setUsuariosDisponibles([]);
                setAccionesDisponibles([]);
            }
        };
        cargarOpciones();
    }, []);

    // --- Función para obtener registros filtrados ---
    const obtenerBitacora = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();
            if (usuario) params.append("usuario", usuario);
            if (tipoAccion) params.append("accion", tipoAccion);
            if (desde) params.append("desde", desde);
            if (hasta) params.append("hasta", hasta);

            const res = await fetch(`http://localhost:5000/api/bitacora?${params.toString()}`);
            const data = await res.json();

            setRegistros(Array.isArray(data.bitacora) ? data.bitacora : []);
            setFiltroActivo(true); // ✅ Mostrar tabla solo al aplicar filtro
        } catch (error) {
            console.error("Error al cargar bitácora:", error);
            setRegistros([]);
            setFiltroActivo(false);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        obtenerBitacora();
    };

    const limpiarFiltros = () => {
        setUsuario("");
        setTipoAccion("");
        setDesde(hoy);
        setHasta(hoy);
        setRegistros([]);
        setFiltroActivo(false);
    };

    return (
        <div className="bitacora-container">
            <h2>📜 Registro de Bitácora</h2>

            <div className="filtros-container ">
                <select value={usuario} onChange={(e) => setUsuario(e.target.value)}>
                    <option value="">-- Usuario --</option>
                    {usuariosDisponibles.map((u) => (
                        <option key={u} value={u}>{u}</option>
                    ))}
                </select>

                <select value={tipoAccion} onChange={(e) => setTipoAccion(e.target.value)}>
                    <option value="">-- Tipo de acción --</option>
                    {accionesDisponibles.map((a) => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>

                <div className="fecha-filtros">
                    <label>Desde:</label>
                    <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                    <label>Hasta:</label>
                    <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                </div>

                <button onClick={aplicarFiltros}>🔍 Aplicar Filtros</button>
                <button onClick={limpiarFiltros}>🧹 Limpiar</button>
            </div>

            {loading && <p>Cargando registros...</p>}

            {/* ✅ Solo mostrar tabla si se aplicó el filtro */}
            {!loading && filtroActivo && (
                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Acción</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.length > 0 ? (
                            registros.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.usuario}</td>
                                    <td>{item.accion}</td>
                                    <td>{item.descripcion}</td>
                                    <td>{dayjs.utc(item.fecha).format("DD/MM/YYYY, HH:mm:ss")}</td>
                                    {/* <td>{dayjs(item.fecha).format("DD/MM/YYYY, HH:mm:ss")}</td> */}
                                    {/* <td>{new Date(item.fecha + 'Z').toLocaleString()}</td> */}
                                    {/* <td>{item.fecha}</td> */}
                                    {/* <td>{new Date(item.fecha).toLocaleString()}</td> */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No se encontraron registros</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Bitacora;
