import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: resolve('src/renderer'),
  base: './',
  build: {
    outDir: resolve('out/renderer'),
    emptyOutDir: true
  },
  resolve: {
    alias: [
      { find: '@renderer', replacement: resolve('src/renderer/src') },
      { find: /^\.\/dompurify\/dompurify\.js$/, replacement: 'dompurify' }
    ]
  },
  plugins: [react()]
})
