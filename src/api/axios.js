import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAuthHeaders = () => {
  const token = localStorage.getItem("wechatToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export default api;
