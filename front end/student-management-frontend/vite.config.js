import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Electron loads the built app from the filesystem (file://), so we need
// relative asset paths (base: './') rather than absolute ('/').
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
