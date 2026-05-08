import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || env.REACT_APP_API_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    resolve: {
      extensions: [".jsx", ".js", ".json"],
    },
    server: {
      port: 3000,
    },
    preview: {
      port: 4173,
    },
    define: {
      "process.env.REACT_APP_API_URL": JSON.stringify(apiUrl),
    },
  };
});
