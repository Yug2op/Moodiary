// src/apis/ai.js or inside your existing endpoints map
import api from "./client";

export const aiAPI = {
  refineNote: (note) => api.post("/ai/refine", { note }),
};