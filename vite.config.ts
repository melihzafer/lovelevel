import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/", // Change to '/lovelevel/' for GitHub Pages deployment
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      strategies: "generateSW", // Switched from injectManifest to fix build
      // srcDir: "src",
      // filename: "sw.ts",
      manifest: {
        name: "LoveLevel - Relationship Companion",
        short_name: "LoveLevel",
        description:
          "A delightful PWA for couples featuring relationship tracking, challenges, and a virtual pet companion",
        theme_color: "#e7507a",
        background_color: "#e7507a",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/mobile-1.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Home Screen"
          },
          {
            src: "/screenshots/desktop-1.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Dashboard View"
          }
        ],
      },
      devOptions: {
        enabled: false, // Disabled in dev to prevent workbox noise - only use in production
        type: "module",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
});
