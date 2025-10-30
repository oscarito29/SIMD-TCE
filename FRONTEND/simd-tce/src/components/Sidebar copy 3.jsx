import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './style/sidebar.css';

const Sidebar = ({ menuItems, activo, seleccionarItem }) => {
  const navigate = useNavigate();
  const [submenuAbierto, setSubmenuAbierto] = useState(null);

  // Manejo de clics en ítems principales
  const handleItemClick = (item) => {
    if (item.subItems) {
      // Si tiene subItems, alternamos submenú
      setSubmenuAbierto(submenuAbierto === item.nombre ? null : item.nombre);
    } else {
      // Si es item normal, navegamos
      seleccionarItem(item.nombre);
      navigate(item.ruta);
      setSubmenuAbierto(null); // cerramos submenús
    }
  };

  // Manejo de clics en subítems
  const handleSubItemClick = (sub) => {
    seleccionarItem(sub.nombre);
    navigate(sub.ruta);
  };

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">SIMD-TCE</h1>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.nombre}>
            <button
              onClick={() => handleItemClick(item)}
              className={`sidebar-button ${activo === item.nombre ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icono}</span>
              {item.nombre}
              {item.subItems && (
                <span className="submenu-arrow">
                  {submenuAbierto === item.nombre ? "▲" : "▼"}
                </span>
              )}
            </button>

            {/* Submenú */}
            {/* {item.subItems && submenuAbierto === item.nombre && (
              <div className="submenu">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.nombre}
                    onClick={() => handleSubItemClick(sub)}
                    className={`sidebar-subbutton ${
                      activo === sub.nombre ? "active" : ""
                    }`}
                  >
                    <span className="sidebar-icon">{item.sub.icono}</span>
                    {sub.nombre}
                  </button>
                ))}
              </div>
            )} */}

            {item.subItems && submenuAbierto === item.nombre && (
              <div className="submenu">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.nombre}
                    onClick={() => handleSubItemClick(sub)}
                    className={`sidebar-subbutton ${activo === sub.nombre ? "active" : ""
                      }`}
                  >
                    <span className="sidebar-icon">{sub.icono}</span>
                    {sub.nombre}
                  </button>
                ))}
              </div>
            )}

          </div>
        ))}
      </nav>
      <footer className="sidebar-footer">© 2025 SIMD-TCE</footer>
    </aside>
  );
};

export default Sidebar;
