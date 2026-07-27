import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config";
import { svelteTesting } from "@testing-library/svelte/vite";

export default mergeConfig(
    viteConfig,
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