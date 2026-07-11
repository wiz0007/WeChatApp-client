import api, { getAuthHeaders } from "./axios";

const authConfig = () => ({
  headers: getAuthHeaders(),
});

export const searchUsersByUsername = (username) =>
  api.get("/search/users", {
    ...authConfig(),
    params: { username },
  });

export const getUserByUsername = (username) =>
  api.get(`/users/username/${encodeURIComponent(username)}`, authConfig());

export const updatePrivacySettings = (settings) =>
  api.patch("/users/me/privacy", settings, authConfig());

export const getConnections = (status = "accepted") =>
  api.get("/connections", {
    ...authConfig(),
    params: { status },
  });

export const sendConnectionRequest = (userId) =>
  api.post(`/connections/request/${userId}`, {}, authConfig());

export const respondToConnection = (connectionId, action) =>
  api.patch(`/connections/${connectionId}/respond`, { action }, authConfig());

export const removeConnection = (connectionId) =>
  api.delete(`/connections/${connectionId}`, authConfig());

export const getChatRequests = (box = "inbox") =>
  api.get("/chat-requests", {
    ...authConfig(),
    params: { box },
  });

export const sendChatRequest = (userId, messagePreview = "") =>
  api.post("/chat-requests", { userId, messagePreview }, authConfig());

export const respondToChatRequest = (requestId, action) =>
  api.patch(`/chat-requests/${requestId}/respond`, { action }, authConfig());

export const getBlockedUsers = () =>
  api.get("/safety/blocks", authConfig());

export const blockUser = (userId) =>
  api.post(`/safety/blocks/${userId}`, {}, authConfig());

export const unblockUser = (userId) =>
  api.delete(`/safety/blocks/${userId}`, authConfig());

export const reportUser = (userId, reason, details = "") =>
  api.post(`/safety/reports/${userId}`, { reason, details }, authConfig());

export const getNotifications = () =>
  api.get("/notifications", authConfig());

export const markNotificationRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`, {}, authConfig());

export const markAllNotificationsRead = () =>
  api.patch("/notifications/read-all", {}, authConfig());
