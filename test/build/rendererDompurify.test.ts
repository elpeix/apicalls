import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createServer, type ViteDevServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const monacoSanitizer = resolve('node_modules/monaco-editor/esm/vs/base/browser/domSanitize.js')
const vendoredImport = './dompurify/dompurify.js'

describe('renderer build DOMPurify resolution', () => {
  let server: ViteDevServer

  beforeAll(async () => {
    server = await createServer({
      configFile: resolve('vite.renderer.config.ts'),
      logLevel: 'silent',
      server: { middlewareMode: true, ws: false }
    })
  })

  afterAll(async () => {
    await server?.close()
  })

  it('monaco imports its vendored DOMPurify copy', () => {
    expect(readFileSync(monacoSanitizer, 'utf8')).toContain(`from '${vendoredImport}'`)
  })

  it('resolves monaco vendored DOMPurify to the dompurify package', async () => {
    const resolved = await server.environments.client.pluginContainer.resolveId(
      vendoredImport,
      monacoSanitizer
    )

    expect(resolved?.id).toMatch(/node_modules\/(dompurify\/|\.vite\/deps\/dompurify\.js)/)
    expect(resolved?.id).not.toMatch(/monaco-editor/)
  })
})
