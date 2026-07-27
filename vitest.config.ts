import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: "electron",
    include: ['src/**/*.test.ts'],
    exclude: [
      'node_modules/**',
      'svelte-frontend/**'
    ]
  }
})