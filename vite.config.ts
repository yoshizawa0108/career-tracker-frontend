import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/companies": "http://localhost:8000",
      "/applications": "http://localhost:8000",
      "/interviews": "http://localhost:8000",
      "/dashboard": "http://localhost:8000",
    },
  },
});