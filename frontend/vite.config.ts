import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ bên ngoài container
    port: 5173,      // Port mặc định của Vite
    strictPort: true, // Không tự động chuyển sang port khác nếu port 5173 bị sử dụng
    watch: {
      usePolling: true, // Cần thiết trong Docker để hot reload hoạt động
    },
  },
});
