// src/apis/friends.js
import api from "./client";

export const friendsAPI = {
  getSuggested: () => api.get("/search/suggestedUsers"),
  searchNetwork: (query) => api.get(`/search/searchUser?query=${query}`),
  sendRequest: (receiverId) => api.post("/friend/request", { receiverId }),
  respondToRequest: (requestId, action) => api.put(`/friend/request/${requestId}`, { action }),
  getPending: () => api.get("/friend/requests/pending"),
  getFriendsList: () => api.get("/friend/list"),
  getSentRequests: () => api.get("/friend/requests/sent"),
};