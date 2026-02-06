import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/tic-tac-toe-logic-check/",
  server: {
    allowedHosts: ["lordsayur-2.local"],
  },
});
