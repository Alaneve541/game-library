import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base 用项目页路径（https://<user>.github.io/game-library/），
// 本地 dev 与 preview 也走同一路径，避免"本地能跑、线上 404"。
export default defineConfig({
  plugins: [react()],
  base: "/game-library/",
  server: { port: 5178, strictPort: true },
  build: { outDir: "dist", chunkSizeWarningLimit: 900 },
});
