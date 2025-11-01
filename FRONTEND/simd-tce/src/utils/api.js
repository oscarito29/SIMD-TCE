// utils/api.js
export async function apiFetch(url, options = {}) {
  try {
    // Token de sesión
    const token = localStorage.getItem("token");

    // Combinar headers
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Ejecutar el fetch real
    const response = await fetch(url, { ...options, headers });

    // 🧠 Si el token expiró, cerrar sesión automáticamente
    if (response.status === 401) {
      console.warn("⚠️ Token expirado o inválido. Cerrando sesión...");
      localStorage.removeItem("token");
      localStorage.removeItem("nombre");
      localStorage.removeItem("rol");
      localStorage.removeItem("username");
      window.location.href = "/"; // Redirigir al login
    }

    // Devolvemos el response normal (como fetch)
    return response;

  } catch (error) {
    console.error("❌ Error en apiFetch:", error);
    throw error;
  }
}
