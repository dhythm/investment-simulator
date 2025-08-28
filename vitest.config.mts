import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'next.config.mjs',
        'postcss.config.mjs',
        'tailwind.config.ts',
        '**/*.config.{js,ts,mjs}',
        '**/*.d.ts',
        'coverage/**',
        'dist/**',
      ]
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})