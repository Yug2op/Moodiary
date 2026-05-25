// src/apis/profile.js
import api from "./client";

export const profileAPI = {
  getMe: () => api.get("/profile/me"),
  updateProfile: (formData) => api.put("/profile/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data", 
    }
  }),
};