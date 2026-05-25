import api from "./client";

export const moodAPI = {
  createOrUpdateMood: (data) => 
    api.post(`/mood/create`, data),
};