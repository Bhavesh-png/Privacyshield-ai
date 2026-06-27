import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from 'path'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as Parameters<typeof crx>[0]['manifest'] }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    minify: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    hmr: {
      port: 5173,
    },
  },
})

