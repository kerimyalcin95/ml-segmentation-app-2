import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig(
    {
        ignores: [
            "node_modules",
            "svelte-frontend/node_modules",
            "dist",
            "svelte-frontend/dist",
            "svelte-frontend/public",
            "assets",
            "make",
            ".svelte-kit",
            "build",
        ],
    },

    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    ...svelte.configs.recommended.map((config) => ({
        ...config,
        files: ["svelte-frontend/src/**/*.svelte"],
        languageOptions: {
            ...config.languageOptions,
            parser: svelteParser,
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    })),

    {
        files: [
            "src/**/*.{ts,svelte}",
            "svelte-frontend/src/**/*.{ts,svelte}",
        ],
        rules: {
            "@typescript-eslint/prefer-as-const": "warn",
            'no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxEOF: 0,
                    maxBOF: 0,
                },
            ],
        },
    },


);