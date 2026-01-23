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
    // Forza un build pulito con hash unici
    rollupOptions: {
      output: {
        // Usa hash completo per forzare nuovi nomi file ad ogni build
        entryFileNames: `assets/[name]-[hash:8].js`,
        chunkFileNames: `assets/[name]-[hash:8].js`,
        assetFileNames: `assets/[name]-[hash:8].[ext]`,
      },
    },
    // Aumenta il limite di warning per file grandi (index.js è ~1.3MB)
    chunkSizeWarningLimit: 1500,
    // Forza la generazione di source maps in produzione per debugging
    sourcemap: false,
  },
}));
