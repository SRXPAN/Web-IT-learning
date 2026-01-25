import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@packages/shared': path.resolve(__dirname, './src/shared'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Use esbuild to avoid the optional terser dependency during CI/CD builds.
    minify: 'esbuild',
  },
  server: {
    port: 5173,
    proxy: {
      // Proxies /api requests to your backend (Express/NestJS running on port 4000)
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})