import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/auth", // your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
