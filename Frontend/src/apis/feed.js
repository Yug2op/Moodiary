// src/apis/feed.js
import api from "./client";

export const feedAPI = {
  getFriendsToday: (page = 1, limit = 10) => 
    api.get(`/feed/friends-today?page=${page}&limit=${limit}`),
  toggleReaction: (moodId, emoji) => 
    api.post(`/reaction/react/${moodId}`, { emoji }),
};