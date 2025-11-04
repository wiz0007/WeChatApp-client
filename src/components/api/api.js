// client/src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://wechat-server-sorq.onrender.com/api", // Change if your backend runs on another port
  withCredentials: true,
});

export default API;
