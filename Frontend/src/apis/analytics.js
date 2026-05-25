// src/apis/analytics.js
import api from "./client";

export const analyticsAPI = {
  getSummary: () => api.get("analytics/dashboard-summary"),
  getLastUpdates: () => api.get("analytics/lastUpdates"),
};