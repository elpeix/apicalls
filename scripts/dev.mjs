import { spawn } from 'node:child_process'
import electronPath from 'electron'
import { build, createServer } from 'vite'

let child = null
let restartTimer = null

function launchElectron(url) {
  const start = () => {
    child = spawn(electronPath, ['.'], {
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_RENDERER_URL: url, NODE_ENV: 'development' }
    })
    child.on('exit', (code) => process.exit(code ?? 0))
  }

  if (child) {
    const old = child
    child = null
    old.removeAllListeners('exit')
    old.once('exit', start)
    old.kill()
  } else {
    start()
  }
}

async function main() {
  const server = await createServer({ configFile: 'vite.renderer.config.ts' })
  await server.listen()
  const url = server.resolvedUrls?.local?.[0] ?? `http://localhost:${server.config.server.port ?? 5173}`
  server.printUrls()

  let mainReady = false
  let preloadReady = false
  let launched = false

  const onEnd = (which) => {
    if (which === 'main') mainReady = true
    else preloadReady = true
    if (!mainReady || !preloadReady) return

    if (!launched) {
      launched = true
      launchElectron(url)
    } else {
      clearTimeout(restartTimer)
      restartTimer = setTimeout(() => launchElectron(url), 200)
    }
  }

  const watch = (configFile, which) =>
    build({ configFile, mode: 'development', build: { watch: {} } }).then((watcher) => {
      watcher.on('event', (event) => {
        if (event.code === 'ERROR') console.error(`[${which}]`, event.error?.message ?? event.error)
        else if (event.code === 'END') onEnd(which)
      })
    })

  await watch('vite.main.config.ts', 'main')
  await watch('vite.preload.config.ts', 'preload')
}

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
