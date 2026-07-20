import { build } from 'vite'

const configs = ['vite.main.config.ts', 'vite.preload.config.ts', 'vite.renderer.config.ts']

for (const configFile of configs) {
  await build({ configFile })
}
