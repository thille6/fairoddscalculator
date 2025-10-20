import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// GitHub Pages requires a base path based on the repository name
// For GitHub Pages, the base should be '/fairoddscalculator/' (with leading and trailing slashes)
export default defineConfig({
  base: '/fairoddscalculator/',
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle: () => {
        // Copy 404.html to dist folder after build
        copyFileSync('404.html', 'dist/404.html');
      }
    }
  ],
  server: {
    open: true,
    port: 3000,
    strictPort: false,
    host: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx'
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
});