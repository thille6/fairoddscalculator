import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages requires a base path based on the repository name
// For GitHub Pages, the base should be '/fairoddscalculator/' (with leading and trailing slashes)
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'production' || process.env.CI === 'true';
const basePath = isGitHubPages ? '/fairoddscalculator/' : '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
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