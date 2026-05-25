// src/apis/auth.js
import api from "./client";

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (payload) => api.post("/auth/signup", payload),
  logout: () => api.post("/auth/logout"),
};