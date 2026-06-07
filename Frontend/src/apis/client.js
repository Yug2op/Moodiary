// src/apis/client.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ⚡ Request Interceptor: Automatically inject Bearer Token on every single outgoing call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
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

// ⚡ Response Interceptor: Seamless token rotation handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (originalRequest.url.includes("/auth/refresh") || originalRequest.url.includes("/auth/login")) {
        localStorage.clear();
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return Promise.reject(error.response?.data || { message: "Session expired." });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        
        // ⚡ Pass the refresh token in the JSON body payload
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken }
        );

        const { accessToken, refreshToken } = response.data;

        // Save the fresh tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        isRefreshing = false;
        processQueue(null, accessToken);

        // Update current failed request header and replay it
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        localStorage.clear();
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        return Promise.reject({ message: "Session expired. Please log in again." });
      }
    }

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: "Network connection error." });
  }
);

export default api;