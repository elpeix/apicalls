import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

function makeIpcRenderer() {
  return {
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    send: vi.fn(),
    invoke: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn()
  }
}

function makeMatchMedia(matches = false) {
  return (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }) as unknown as MediaQueryList
}

if (!document.queryCommandSupported) {
  document.queryCommandSupported = () => false
}
if (!document.execCommand) {
  document.execCommand = () => false
}

beforeEach(() => {
  window.matchMedia = makeMatchMedia(false)
  ;(window as unknown as { electron: unknown }).electron = {
    ipcRenderer: makeIpcRenderer(),
    process: { platform: process.platform }
  }
  ;(window as unknown as { api: unknown }).api = {
    os: {
      isWindows: false,
      isMac: false,
      isLinux: true,
      platform: 'linux',
      arch: 'x64'
    }
  }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
