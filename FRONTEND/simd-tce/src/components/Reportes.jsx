import React from "react";
import "./style/reportes.css"; 

const Reportes = () => {
  const descargarReporte = () => {
    fetch("https://simd-tce.duckdns.org/api/reportes/pdf")
      .then((res) => {
        if (!res.ok) throw new Error("Error al generar el reporte");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reporte.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div className="reportes-container">
      <h1>📄 Reportes</h1>
      <p>Haz clic en el botón para descargar el reporte en PDF.</p>
      <button onClick={descargarReporte}>
        Descargar Reporte PDF
      </button>
    </div>
  );
};

export default Reportes;
