import { defineConfig } from "vite";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
});
