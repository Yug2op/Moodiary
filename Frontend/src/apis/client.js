// src/apis/client.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // ⚡ CRITICAL: Allows cookies to pass between frontend and backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple concurrent refresh calls if multiple requests fail at once
let isRefreshing = false;
// Queue to hold failed requests while the token is refreshing
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ⚡ Unified Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response.data; // Strips standard Axios wrapper objects cleanly
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Handle Expired Access Token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If the request that failed WAS the refresh endpoint itself, do not retry!
      if (originalRequest.url.includes("/auth/refresh") || originalRequest.url.includes("/auth/login")) {
        localStorage.removeItem("isLoggedIn");
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return Promise.reject(error.response?.data || { message: "Session expired." });
      }

      if (isRefreshing) {
        // If a refresh is already in progress, queue this request up
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest); // Retry original request when queue resolves
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Mark this request so we don't end up in an infinite retry loop
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Access token expired. Attempting silent token refresh...");
        
        // Call the refresh endpoint on the backend
        await api.post("/auth/refresh");
        
        isRefreshing = false;
        processQueue(null); // Resolve all pending requests in the queue

        // Retry the original request that failed
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null); // Reject the queue

        console.warn("❌ Refresh token expired or invalid. Redirecting to login portal.");
        localStorage.removeItem("isLoggedIn");
        
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return Promise.reject({ message: "Session expired. Please log in again." });
      }
    }

    // 2. Pass standard server errors (like 400 Bad Request or custom 503 errors) directly through
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({ message: "Network connection error. Server might be down." });
  }
);

export default api;