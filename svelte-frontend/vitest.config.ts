import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config";
import { svelteTesting } from "@testing-library/svelte/vite";

const resolvedViteConfig =
    typeof viteConfig === "function"
        ? viteConfig({ mode: "test", command: "serve", isSsrBuild: false, isPreview: false })
        : viteConfig;

export default mergeConfig(
    resolvedViteConfig,
    defineConfig({
        plugins: [svelteTesting()],
        test: {
            name: "svelte components",
            include: ["src/lib/components/**/*.test.ts"],
            environment: "jsdom",
            globals: true,
            setupFiles: ["./src/test/setup.ts"],
        },
    }),
);