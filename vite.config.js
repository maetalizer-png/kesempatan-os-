import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    target: 'esnext',
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  optimizeDeps: {
    exclude: ['workers']
  },
  worker: {
    format: 'es'
  },
  server: {
    port: 3000,
    open: false,
    cors: true
  },
  preview: {
    port: 4173
  }
});
