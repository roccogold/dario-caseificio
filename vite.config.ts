import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt", // Change to prompt to force update
      includeAssets: ["frog-logo.svg", "favicon.ico"],
      manifest: {
        name: "DARIO - Caseificio",
        short_name: "DARIO",
        description: "Sistema di gestione per caseificio artigianale",
        theme_color: "#8B7355",
        icons: [
          {
            src: "/frog-logo.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // Force update on navigation
        skipWaiting: true,
        clientsClaim: true,
        // Force cache refresh - delete old caches
        cleanupOutdatedCaches: true,
        // Don't cache index.html - always fetch fresh
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Disable in production
      },
    }),
  ].filter(Boolean),
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
