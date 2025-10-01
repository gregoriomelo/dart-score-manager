import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Detect deployment target
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const isCloudflare = process.env.CLOUDFLARE === 'true';
const base = isGitHubPages ? '/dart-score-manager/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
  define: {
    'import.meta.env.GITHUB_PAGES': JSON.stringify(process.env.GITHUB_PAGES === 'true'),
    'import.meta.env.CLOUDFLARE': JSON.stringify(process.env.CLOUDFLARE === 'true'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  
  publicDir: 'public',
  root: '.',
  server: {
    port: 3000,
    open: true,
    host: true,
    strictPort: false,
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    exclude: ['e2e/**', '**/*.e2e.*', 'node_modules/**'],
  },
});
