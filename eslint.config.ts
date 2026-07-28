import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import tseslint from "typescript-eslint";

const typeAwareParserOptions = {
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
};

export default tseslint.config(
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
            "svelte-frontend/stats.html",
        ],
    },

    {
        languageOptions: {
            globals: globals.browser,
        },
    },

    js.configs.recommended,

    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: typeAwareParserOptions,
        },
    },

    ...tseslint.configs.strictTypeChecked,

    ...svelte.configs.recommended.map((config) => ({
        ...config,
        files: ["svelte-frontend/src/**/*.svelte"],
        languageOptions: {
            ...config.languageOptions,
            parser: svelteParser,
            parserOptions: {
                parser: tseslint.parser,
                ...typeAwareParserOptions,
            },
        },
    })),

    {
        files: [
            "src/**/*.{ts,svelte}",
            "svelte-frontend/**/*.{ts,svelte}",
        ],
        rules: {
            "@typescript-eslint/prefer-as-const": "warn",
            "no-multiple-empty-lines": [
                "error",
                {
                    max: 1,
                    maxEOF: 0,
                    maxBOF: 0,
                },
            ],
        },
    },
);