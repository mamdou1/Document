/**
 * api/axios.ts
 *
 * Configuration de l'instance Axios pour les appels API
 * - Définition de l'URL de base via .env
 * - Timeout global pour les requêtes
 * - Intercepteur automatique du token JWT
 */

// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
//   timeout: 10000,
// });

// // Request interceptor : ajoute le token si present
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");

//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor : ajoute le token + audit flag
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const audit = sessionStorage.getItem("audit");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ Inject audit header only if set by UI
  if (audit) {
    config.headers = config.headers || {};
    config.headers["x-audit"] = "true";
    sessionStorage.removeItem("audit");
  }

  return config;
});

export default api;
