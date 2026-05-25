// src/apis/client.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // ⚡ CRITICAL: This allows cookies to pass between frontend and backend
  headers: {
    "Content-Type": "application/json",
  },
});

// ⚡ Unified Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response.data; // Strips standard Axios wrapper objects cleanly
  },
  (error) => {
    // 1. If session is dead or unauthorized, clean up and redirect
    if (error.response?.status === 401) {
      console.warn("Unauthorized/Expired session. Redirecting to login portal.");
      localStorage.removeItem("isLoggedIn"); // Clean up flag tracking
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
      return Promise.reject({ message: "Session expired. Please log in again." });
    }

    // 2. Pass standard server errors (like 400 Bad Request error messages) directly through
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({ message: "Network connection error. Server might be down." });
  }
);

export default api;