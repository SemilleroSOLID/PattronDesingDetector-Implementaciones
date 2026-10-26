/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages sirve la app bajo /<repo>/. VITE_BASE permite cambiarlo (por ejemplo "/" en un fork o en local).
const base = process.env.VITE_BASE ?? '/PattronDesingDetector-Implementaciones/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
