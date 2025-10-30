import React, { useState, useEffect } from "react";
import "./style/bitacora.css";

const Bitacora = () => {
    // Fecha actual en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];

    const [usuario, setUsuario] = useState("");
    const [tipoAccion, setTipoAccion] = useState("");
    const [desde, setDesde] = useState(hoy);
    const [hasta, setHasta] = useState(hoy);
    const [registros, setRegistros] = useState([]); // siempre definido
    const [loading, setLoading] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState(false);

    // --- Función para obtener bitácora desde la API ---
    const obtenerBitacora = async () => {
        setLoading(true);
        setFiltroActivo(true);

        try {
            const params = new URLSearchParams();
            if (usuario) params.append("usuario", usuario);
            if (tipoAccion) params.append("tipo_accion", tipoAccion);
            if (desde) params.append("desde", desde);
            if (hasta) params.append("hasta", hasta);

            const res = await fetch(`http://localhost:5000/api/bitacora?${params.toString()}`);
            const data = await res.json();

            // ✅ Validación: si no es arreglo, asignamos []
            setRegistros(Array.isArray(data.bitacora) ? data.bitacora : []);
        } catch (error) {
            console.error("Error al cargar bitácora:", error);
            setRegistros([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Cargar automáticamente registros del día al iniciar ---
    useEffect(() => {
        obtenerBitacora();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

            <div className="filtros-container">
                <input
                    type="text"
                    placeholder="Buscar por usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                />

                <select value={tipoAccion} onChange={(e) => setTipoAccion(e.target.value)}>
                    <option value="">-- Tipo de acción --</option>
                    <option value="LOGIN">Inicio de sesión</option>
                    <option value="INSCRIPCIÓN">Inscripción</option>
                    <option value="PAGO">Pago</option>
                    <option value="ACTUALIZACIÓN">Actualización</option>
                    <option value="ELIMINACIÓN">Eliminación</option>
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

            {!loading && filtroActivo && (
                <table className="tabla-bitacora">
                    <thead>
                        <tr>
                            <th>ID</th>
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
                                    <td>{item.id}</td>
                                    <td>{item.usuario}</td>
                                    <td>{item.accion}</td>
                                    <td>{item.descripcion}</td>
                                    <td>{new Date(item.fecha).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No se encontraron registros</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Bitacora;
