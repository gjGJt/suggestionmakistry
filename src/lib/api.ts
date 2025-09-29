// src/lib/api.ts
import axios from "axios";

/**
 * Works out-of-the-box with Vite.
 *   • add VITE_API_URL to your .env                (no NEXT_PUBLIC_ prefix needed)
 *   • Vite inlines the value during build
 */
const baseURL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";           // fallback for dev

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
