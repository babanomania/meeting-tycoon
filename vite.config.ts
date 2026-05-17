import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Base path is controlled by VITE_BASE_PATH so the same build serves both
// local preview ('/') and GitHub Pages ('/meeting-tycoon/'). The workflow
// sets VITE_BASE_PATH=/meeting-tycoon/ at build time.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.VITE_BASE_PATH ?? '/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
