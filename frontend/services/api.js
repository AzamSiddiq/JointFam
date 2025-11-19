// src/services/api.js
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000"; // change if deployed

// Axios instance for API calls
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Single socket connection (connect manually after login)
export const socket = io(API_URL, {
  autoConnect: false,
  transports: ["websocket"],
});
