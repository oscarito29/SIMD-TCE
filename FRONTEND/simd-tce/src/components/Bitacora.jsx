import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "./style/bitacora.css";
import { apiFetch } from "../utils/api";
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

    // --- NUEVO: estados de paginación ---
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 10;

    // --- Cargar siempre todas las opciones disponibles al iniciar ---
    useEffect(() => {
        const cargarOpciones = async () => {
            try {
                // const res = await apiFetch("https://simd-tce.duckdns.org/api/bitacora");
                const res = await apiFetch("http://localhost:5000/api/bitacora");
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

            // const res = await apiFetch(`https://simd-tce.duckdns.org/api/bitacora?${params.toString()}`);
            const res = await apiFetch(`http://localhost:5000/api/bitacora?${params.toString()}`);
            const data = await res.json();

            setRegistros(Array.isArray(data.bitacora) ? data.bitacora : []);
            setFiltroActivo(true); // ✅ Mostrar tabla solo al aplicar filtro
            setPaginaActual(1); // Reiniciar a la primera página
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
        setPaginaActual(1);
    };

    // --- Lógica para paginación ---
    const totalPaginas = Math.ceil(registros.length / registrosPorPagina);
    const indiceInicio = (paginaActual - 1) * registrosPorPagina;
    const indiceFin = indiceInicio + registrosPorPagina;
    const registrosPagina = registros.slice(indiceInicio, indiceFin);

    const siguientePagina = () => {
        if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
    };

    const anteriorPagina = () => {
        if (paginaActual > 1) setPaginaActual(paginaActual - 1);
    };

    const irAPagina = (num) => {
        setPaginaActual(num);
    };

    return (
        <div className="bitacora-container">
            <h1>📜 Registro de Bitácora</h1>

            <div className="filtros-container">
                <div className="filtro-item">
                    <label>Usuario:</label>
                    <select value={usuario} onChange={(e) => setUsuario(e.target.value)}>
                        <option value="">Seleccione un Usuario</option>
                        {usuariosDisponibles.map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>

                <div className="filtro-item">
                    <label>Acción:</label>
                    <select value={tipoAccion} onChange={(e) => setTipoAccion(e.target.value)}>
                        <option value="">Seleccione un Tipo de acción</option>
                        {accionesDisponibles.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div className="filtro-item">
                    <label>Desde:</label>
                    <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
                    <label>Hasta:</label>
                    <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                </div>
                <button onClick={aplicarFiltros} className="btn-primary">🔍 Aplicar Filtros</button>
                <button onClick={limpiarFiltros} className="btn-primary">🧹 Limpiar</button>
            </div>

            {/* Tabla siempre visible */}
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
                    {loading ? (
                        <tr>
                            <td colSpan="4">Cargando registros...</td>
                        </tr>
                    ) : registrosPagina.length > 0 ? (
                        registrosPagina.map((item) => (
                            <tr key={item.id}>
                                <td>{item.usuario}</td>
                                <td>{item.accion}</td>
                                <td>{item.descripcion}</td>
                                <td>{dayjs.utc(item.fecha).format("DD/MM/YYYY, HH:mm:ss")}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No se encontraron registros</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* --- NUEVA PAGINACIÓN NUMERADA --- */}
            {registros.length > registrosPorPagina && (
                <div className="paginacion-numerada">
                    <button onClick={anteriorPagina} disabled={paginaActual === 1}>⟨</button>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                            key={i}
                            className={paginaActual === i + 1 ? "activo" : ""}
                            onClick={() => irAPagina(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={siguientePagina} disabled={paginaActual === totalPaginas}>⟩</button>
                </div>
            )}
        </div>
    );
};

export default Bitacora;
