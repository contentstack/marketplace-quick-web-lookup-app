import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.d.ts',
        'src/setupTests.ts',
        'src/test-utils/**',
        'src/common/types/**',
      ],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external access
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
    // Force Vite to use the project directory for temp files
    force: true,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  // Add cache directory configuration
  cacheDir: '.vite',
});
