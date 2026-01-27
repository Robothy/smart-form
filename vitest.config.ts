import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./__tests__/setup/vitest-setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '!**/__tests__/e2e/**'],
    exclude: ['node_modules', 'dist', '.next', 'out', '__tests__/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '.next/',
        'out/',
      ],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@__tests__': path.resolve(__dirname, './__tests__'),
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/x-date-pickers',
      '@mui/system',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
})
