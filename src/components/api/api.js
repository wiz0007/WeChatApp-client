// client/src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Change if your backend runs on another port
  withCredentials: true,
});

export default API;
