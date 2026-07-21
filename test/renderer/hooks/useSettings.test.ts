import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSettings } from '../../../src/renderer/src/hooks/useSettings'
import { SETTINGS } from '../../../src/lib/ipcChannels'
import { defaultSettings } from '../../../src/lib/defaults'

type IpcMock = { on: Mock; send: Mock; removeAllListeners: Mock }

function ipc(): IpcMock {
  return window.electron!.ipcRenderer as unknown as IpcMock
}

function handlerFor(channel: string) {
  const call = ipc().on.mock.calls.find((c) => c[0] === channel)
  return call?.[1] as ((event: unknown, payload: unknown) => void) | undefined
}

describe('useSettings', () => {
  beforeEach(() => {
    window.matchMedia = ((query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }) as unknown as MediaQueryList) as typeof window.matchMedia
  })

  it('starts with null settings and requests settings on mount', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toBeNull()
    expect(ipc().send).toHaveBeenCalledWith(SETTINGS.get)
  })

  it('derives editor theme from the system color scheme when there are no settings', () => {
    window.matchMedia = ((query: string) =>
      ({ matches: true, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList) as typeof window.matchMedia
    const { result } = renderHook(() => useSettings())
    expect(result.current.getEditorTheme().name).toBe('vs-dark')
  })

  it('applies an incoming settings update', () => {
    const { result } = renderHook(() => useSettings())
    const updated = handlerFor(SETTINGS.updated)
    expect(updated).toBeTypeOf('function')
    act(() => updated!(null, { ...defaultSettings, theme: 'light' }))
    expect(result.current.settings?.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('save persists and detects a menu change against the previous settings', () => {
    const { result } = renderHook(() => useSettings())
    const updated = handlerFor(SETTINGS.updated)
    act(() => updated!(null, { ...defaultSettings, theme: 'light', menu: true }))

    act(() => result.current.save({ ...defaultSettings, theme: 'light', menu: false }))

    expect(result.current.settings?.menu).toBe(false)
    expect(ipc().send).toHaveBeenCalledWith(SETTINGS.save, expect.objectContaining({ menu: false }))
    expect(ipc().send).toHaveBeenCalledWith(SETTINGS.toggleMenu, false)
  })
})
