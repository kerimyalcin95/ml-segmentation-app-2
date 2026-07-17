import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte()
    ],
  base: './',
  build: {
    outDir: './dist',
    assetsDir: './assets',
  },
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
  define: {
        __BUILD_TIME__: JSON.stringify(new Date().toLocaleString())
    }
})
