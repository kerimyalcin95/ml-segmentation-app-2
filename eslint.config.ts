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

export default defineConfig(
    {
        ignores: [
            // ...
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
                ...(config.languageOptions?.parserOptions ?? {}),
                parser: tseslint.parser,
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: [".svelte"],
            },
        },
    })),

    {
        files: [
            "src/**/*.ts",
            "svelte-frontend/**/*.ts",
        ],
        rules: {
            "@typescript-eslint/no-unnecessary-type-parameters": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    {

        files: ["svelte-frontend/**/*.svelte"],
        rules: {
            "@typescript-eslint/no-useless-default-assignment": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    }
);