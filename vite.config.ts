import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Forza la risoluzione esplicita dei moduli
    dedupe: ["react", "react-dom"],
  },
  build: {
    // Forza un build pulito
    rollupOptions: {
      output: {
        // Genera nomi file deterministici ma unici
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
    // Aumenta il limite di warning per file grandi
    chunkSizeWarningLimit: 1000,
  },
}));
