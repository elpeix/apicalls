import { BrowserWindow, Event, Input } from 'electron'
import { CLOSE_TAB, NEW_REQUEST, NEXT_TAB, PREV_TAB } from '../lib/ipcChannels'

type ShortcutKey = {
  control?: boolean
  alt?: boolean
  shift?: boolean
  commandOrControl?: boolean
  key: string
}

export const registerShortcuts = (mainWindow: BrowserWindow) => {
  const windowShortcut = new WindowShortcut(mainWindow)

  windowShortcut.register(
    {
      commandOrControl: true,
      key: 't'
    },
    () => {
      mainWindow.webContents.send(NEW_REQUEST)
    }
  )
  windowShortcut.register(
    {
      control: true,
      key: 'Tab'
    },
    () => {
      mainWindow.webContents.send(NEXT_TAB)
    }
  )
  windowShortcut.register(
    {
      control: true,
      shift: true,
      key: 'Tab'
    },
    () => {
      mainWindow.webContents.send(PREV_TAB)
    }
  )
  windowShortcut.register(
    {
      commandOrControl: true,
      key: 'w'
    },
    () => {
      mainWindow.webContents.send(CLOSE_TAB)
    }
  )
}

class WindowShortcut {
  shortcuts: Map<string, () => void>
  constructor(private mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.shortcuts = new Map()
    this.mainWindow.webContents.once('dom-ready', this.enable.bind(this))
  }

  public register(shortcut: ShortcutKey, callback: () => void): void {
    const baseKeys = Object.keys(shortcut)
      .filter((v) => v !== 'key')
      .map((v) => {
        if (v === 'commandOrControl') {
          return process.platform === 'darwin' ? 'meta' : 'control'
        }
        return v
      })
      .sort()
    baseKeys.push(shortcut.key)
    const shortcutKey = baseKeys.join('+')
    if (!this.shortcuts.has(shortcutKey)) {
      this.shortcuts.set(shortcutKey, callback)
    }
  }

  private enable() {
    this.mainWindow.webContents.on('before-input-event', (event: Event, input: Input) => {
      if (input.type !== 'keyDown') {
        return
      }
      const shortcutKey = this.getShortcutKey(input)
      if (!this.shortcuts.has(shortcutKey)) {
        return
      }
      event.preventDefault()
      const callback = this.shortcuts.get(shortcutKey)
      if (callback) {
        callback()
      }
    })
  }

  private getShortcutKey(input: Electron.Input) {
    let baseKeys = []
    if (input.meta) baseKeys.push('meta')
    if (input.control) baseKeys.push('control')
    if (input.shift) baseKeys.push('shift')
    if (input.alt) baseKeys.push('alt')
    baseKeys = baseKeys.sort()
    baseKeys.push(input.key)
    return baseKeys.join('+')
  }
}
