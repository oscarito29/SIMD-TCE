import React, { useState } from "react";
import "./style/parametros.css";

export default function Parametros() {
  const [activeTab, setActiveTab] = useState("generales");

  return (
    <div className="parametros-container">
      <h1>⚙️ Configuración de Parámetros</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "generales" ? "active" : ""}
          onClick={() => setActiveTab("generales")}
        >
          Generales
        </button>
        <button
          className={activeTab === "contacto" ? "active" : ""}
          onClick={() => setActiveTab("contacto")}
        >
          Contacto
        </button>
        <button
          className={activeTab === "estilo" ? "active" : ""}
          onClick={() => setActiveTab("estilo")}
        >
          Estilo
        </button>
        <button
          className={activeTab === "notificaciones" ? "active" : ""}
          onClick={() => setActiveTab("notificaciones")}
        >
          Notificaciones
        </button>
      </div>

      {/* Contenido de cada tab */}
      <form className="parametros-form">
        {activeTab === "generales" && (
          <div className="parametros-grid">
            <label>
              Nombre Hospital/Clínica:
              <input type="text" />
            </label>
            <label>
              Logo (URL):
              <input type="text" />
            </label>
            <label>
              Idioma:
              <select>
                <option>Español</option>
                <option>Inglés</option>
              </select>
            </label>
          </div>
        )}

        {activeTab === "contacto" && (
          <div className="parametros-grid">
            <label>
              Teléfono:
              <input type="text" />
            </label>
            <label>
              Correo:
              <input type="email" />
            </label>
            <label>
              Dirección:
              <input type="text" />
            </label>
          </div>
        )}

        {activeTab === "estilo" && (
          <div className="parametros-grid">
            <label>
              Color Primario:
              <input type="color" />
            </label>
            <label>
              Color Secundario:
              <input type="color" />
            </label>
          </div>
        )}

        {activeTab === "notificaciones" && (
          <div className="parametros-grid">
            <label>
              Notificaciones por correo:
              <select>
                <option>Sí</option>
                <option>No</option>
              </select>
            </label>
            <label>
              Alertas críticas:
              <select>
                <option>Inmediatas</option>
                <option>Resumen diario</option>
              </select>
            </label>
          </div>
        )}

        <button type="submit" className="save-btn">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
