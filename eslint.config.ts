import eslint from "@eslint/js";
import json from "@eslint/json";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";

import path from "node:path";

export default defineConfig(
    {
        ...eslint.configs.recommended,
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            sourceType: "commonjs",
        },
    },

    {
        files: ["**/*.{ts,mts,cts}"],
        languageOptions: {
            parser: tsParser,
            globals: globals.node,
            parserOptions: {
                project: [
                    "./tsconfig.json",
                    "./svelte-frontend/tsconfig.app.json",
                    "./svelte-frontend/tsconfig.node.json",
                ],
                tsconfigRootDir: import.meta.dirname,
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        rules: {
            "@typescript-eslint/prefer-as-const": "warn",
        },
    },

    {
        files: ["svelte-frontend/**/*.svelte"],
        ...svelte.configs.recommended,
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tsParser,
                project: [
                    "./svelte-frontend/tsconfig.app.json",
                    "./svelte-frontend/tsconfig.node.json",
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    {
        files: ["**/*.json"],
        language: "json/json",
        ...json.configs.recommended,
        rules: {
            "json/no-empty-keys": "off",
        },
    }
);