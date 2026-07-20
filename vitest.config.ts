import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['test/**/*.test.{ts,tsx}'],
          exclude: ['test/renderer/components/**', 'test/renderer/hooks/**', '**/node_modules/**']
        }
      },
      {
        plugins: [react()],
        resolve: {
          alias: {
            '@renderer': resolve('src/renderer/src')
          }
        },
        test: {
          name: 'dom',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['test/setup.dom.ts'],
          include: [
            'test/renderer/components/**/*.test.{ts,tsx}',
            'test/renderer/hooks/**/*.test.{ts,tsx}'
          ]
        }
      }
    ]
  }
})
