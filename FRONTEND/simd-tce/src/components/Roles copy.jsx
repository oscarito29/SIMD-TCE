import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./style/roles.css";

const API = "http://localhost:5000/api/roles";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Error al obtener roles");
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los roles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Manejo formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear rol
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      Swal.fire("Atención", "El nombre del rol es obligatorio", "warning");
      return;
    }

    try {
      /* const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }); */
      const token = localStorage.getItem('token'); // el JWT del usuario

      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token // ✅ enviar token
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);

        Swal.fire("Éxito", "Rol creado correctamente", "success");
        setForm({ nombre: "", descripcion: "" });
        fetchRoles();
      } else {
        setModalOpen(false);

        Swal.fire("Error", data.error || "No se pudo crear el rol", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  };

  // Abrir modal edición
  const openEdit = (rol) => {
    setIsEditing(true);
    setEditingId(rol.id);
    setForm({ nombre: rol.nombre || "", descripcion: rol.descripcion || "" });
    setModalOpen(true);
  };

  // Actualizar rol (PUT)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const res = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", "Rol actualizado", "success");
        setIsEditing(false);
        setEditingId(null);
        setForm({ nombre: "", descripcion: "" });
        setModalOpen(false);
        fetchRoles();
      } else {
        Swal.fire("Error", data.error || "No se pudo actualizar", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  };

  // Eliminar rol
  const handleDelete = (rol) => {
    Swal.fire({
      title: `Eliminar rol "${rol.nombre}"?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/${rol.id}`, { method: "DELETE" });
          const data = await res.json();
          if (res.ok) {
            Swal.fire("Eliminado", "Rol eliminado correctamente", "success");
            fetchRoles();
          } else {
            Swal.fire("Error", data.error || "No se pudo eliminar", "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "No se pudo conectar con el servidor", "error");
        }
      }
    });
  };

  // Cerrar modal
  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ nombre: "", descripcion: "" });
  };

  return (
    <div className="roles-container">
      <div className="roles-header">
        <h1>Gestión de Roles</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setModalOpen(true);
            setIsEditing(false);
            setForm({ nombre: "", descripcion: "" });
          }}
        >
          + Crear rol
        </button>
      </div>

      {/* Tabla de roles */}
      {loading ? (
        <p>Cargando roles...</p>
      ) : (
        <div className="roles-table-wrapper">
          <table className="roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                {/*    <th>Fecha creación</th> */}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No hay roles registrados
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.nombre}</td>
                    <td>{r.descripcion || "-"}</td>
                    {/* <td>{r.fecha_creacion || "-"}</td> */}
                    <td className="actions-cell">
                      <button className="btn-quiet" onClick={() => openEdit(r)}>
                        Editar
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(r)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditing ? "Editar Rol" : "Crear Rol"}</h2>
            <form onSubmit={isEditing ? handleUpdate : handleCreate} className="roles-form">
              <label>
                Nombre <span className="req">*</span>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
              </label>

              <label>
                Descripción
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  maxLength={255}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? "Guardar cambios" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
