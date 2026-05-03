import axios from "axios";

export const API_URL =
  "https://wechat-server-w3bp.onrender.com";

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
