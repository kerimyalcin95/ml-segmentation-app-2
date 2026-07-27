import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: "electron",
    include: ['src/**/*.test.{ts,cts}'],
    exclude: [
      'node_modules/**',
      'svelte-frontend/**'
    ]
  }
})