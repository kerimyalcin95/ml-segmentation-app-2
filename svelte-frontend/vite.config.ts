import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { readFileSync } from 'fs';

const packageJson = JSON.parse(
    readFileSync('./../package.json', 'utf-8')
);  

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        svelte()
    ],
    base: './',
    build: {
        outDir: './dist',
        assetsDir: './assets'
    },
    resolve: {
        alias: {
            $lib: path.resolve("./src/lib"),
        },
    },
    define: {
        __BUILD_TIME__: JSON.stringify(new Date().toLocaleString()),
        __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    server: {
        // OneDrive/Windows setups can miss fs events without polling.
        watch: {
            usePolling: true,
            interval: 100
        }
    }
});
