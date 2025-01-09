import { BrowserWindow, Event, Input } from 'electron'
import { ACTIONS } from '../lib/ipcChannels'

type ShortcutKey = {
  control?: boolean
  alt?: boolean
  shift?: boolean
  command?: boolean
  commandOrControl?: boolean
  key: string
}

const isMac = process.platform === 'darwin'

const registeredShortcuts = new Set<string>()

export const registerShortcuts = (mainWindow: BrowserWindow) => {
  const ws = new WindowShortcut(mainWindow)
  const shortcuts = [
    { shortcut: 'commandOrControl+t', action: ACTIONS.newTab },
    { shortcut: 'control+Tab', action: ACTIONS.nextTab },
    { shortcut: 'commandOrControl+p', action: ACTIONS.findRequest },
    { shortcut: 'control+shift+Tab', action: ACTIONS.prevTab },
    { shortcut: 'commandOrControl+w', action: ACTIONS.closeTab },
    { shortcut: 'commandOrControl+b', action: ACTIONS.toggleSidebar },
    { shortcut: 'commandOrControl+Enter', action: ACTIONS.sendRequest },
    { shortcut: 'commandOrControl+s', action: ACTIONS.saveRequest },
    { shortcut: 'commandOrControl+shift+s', action: ACTIONS.saveAsRequest },
    { shortcut: 'commandOrControl+shift+c', action: ACTIONS.toggleConsole },
    { shortcut: 'commandOrControl+shift+p', action: ACTIONS.toggleRequestPanel },
    { shortcut: 'commandOrControl+shift+t', action: ACTIONS.searchTab },
    { shortcut: 'commandOrControl+,', action: ACTIONS.showSettings },
    { shortcut: 'commandOrControl+l', action: ACTIONS.showCollections },
    { shortcut: 'commandOrControl+e', action: ACTIONS.showEnvironments },
    { shortcut: 'commandOrControl+h', action: ACTIONS.showHistory },
    { shortcut: 'commandOrControl+g', action: ACTIONS.showCookies },

    { shortcut: 'escape', action: ACTIONS.escape }
  ]

  shortcuts.forEach(({ shortcut, action }) => {
    if (!registeredShortcuts.has(shortcut)) {
      ws.register(shortcut, action, mainWindow)
      registeredShortcuts.add(shortcut)
    }
  })

  if (!registeredShortcuts.has('commandOrControl+shift+i')) {
    ws.registerCallback('commandOrControl+shift+i', () => mainWindow.webContents.toggleDevTools())
    registeredShortcuts.add('commandOrControl+shift+i')
  }
}

class WindowShortcut {
  shortcuts: Map<string, () => void>

  constructor(private mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.shortcuts = new Map()
    this.mainWindow.webContents.once('dom-ready', this.enable.bind(this))
  }

  public register(shortcut: string, action: string, mainWindow: BrowserWindow): void {
    this.registerCallback(shortcut, () => mainWindow.webContents.send(action))
  }

  public registerCallback(shortcut: string, callback: () => void): void {
    const baseKeys = shortcut.split('+')
    if (['control', 'shift', 'alt', 'meta'].includes(baseKeys[baseKeys.length - 1])) {
      return
    }
    const key = baseKeys.pop()
    if (!key) {
      return
    }
    this.registerShortcut(baseKeys, key, callback)
  }

  public registerAdvanced(shortcut: ShortcutKey, callback: () => void): void {
    const modifierKeys = Object.keys(shortcut).filter((v) => v !== 'key')
    this.registerShortcut(modifierKeys, shortcut.key, callback)
  }

  private registerShortcut(modifierKeys: string[], key: string, callback: () => void) {
    modifierKeys = modifierKeys
      .map((v) => {
        if (v === 'commandOrControl') {
          return isMac ? 'meta' : 'control'
        } else if (v === 'command') {
          return 'meta'
        }
        return v
      })
      .sort()
    modifierKeys = modifierKeys.sort()
    modifierKeys.push(key.toLocaleLowerCase())
    const shortcutKey = modifierKeys.join('+')
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
    baseKeys.push(input.key.toLocaleLowerCase())
    return baseKeys.join('+')
  }
}
