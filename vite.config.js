import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages requires a base path
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const basePath = isGitHubPages ? '/Fair-odds-project/' : '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    open: true,
    port: 3000
  },
  build: {
    outDir: 'dist'
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  }
});