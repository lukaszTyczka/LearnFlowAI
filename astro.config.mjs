import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server", // Enable SSR
  adapter: cloudflare({
    imageService: "compile", // Configure image service within the adapter
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["supertest"], // Explicitly externalize supertest for SSR
    },
  },
});
