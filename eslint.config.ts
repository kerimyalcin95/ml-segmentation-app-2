import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig(
    {
        ignores: [
            "node_modules",
            "dist",
            ".svelte-kit",
            "build",
        ],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    ...svelte.configs.recommended.map((config) => ({
        ...config,
        files: ["src/**/*.svelte"],
        languageOptions: {
            ...config.languageOptions,
            parser: svelteParser,
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    })),

    {
        files: ["src/**/*.{ts,svelte}"],
        rules: {
            "@typescript-eslint/prefer-as-const": "warn",
        },
    },
);