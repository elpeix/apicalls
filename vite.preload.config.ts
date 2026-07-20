import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: 'src/preload/index.ts',
    outDir: 'out/preload',
    emptyOutDir: true,
    minify: false,
    target: 'node20',
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'es',
        entryFileNames: 'index.mjs'
      }
    }
  }
})
