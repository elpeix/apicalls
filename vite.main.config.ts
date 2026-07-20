import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: 'src/main/index.ts',
    outDir: 'out/main',
    emptyOutDir: true,
    minify: false,
    target: 'node20',
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'es',
        entryFileNames: 'index.js'
      }
    }
  }
})
