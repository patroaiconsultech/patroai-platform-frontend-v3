import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUpstream = String(
    env.ORKIO_API_UPSTREAM_URL || env.VITE_API_BASE_URL || "",
  ).trim();

  return {
    plugins: [react()],
    server: apiUpstream
      ? {
          proxy: {
            "/api": {
              target: apiUpstream,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  };
});
