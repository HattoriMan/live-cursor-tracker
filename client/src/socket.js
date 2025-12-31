// src/socket.js
import { io } from "socket.io-client";

// Connect to the backend server
export const socket = io(window.location.origin);