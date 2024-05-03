import { BrowserWindow, globalShortcut } from 'electron'
import { CLOSE_TAB, NEW_REQUEST, NEXT_TAB, PREV_TAB } from '../lib/ipcChannels'

export const registerGlobalShortcuts = (mainWindow: BrowserWindow) => {
  globalShortcut.register('CommandOrControl+N', () => {
    mainWindow.webContents.send(NEW_REQUEST)
  })
  globalShortcut.register('CommandOrControl+Tab', () => {
    mainWindow.webContents.send(NEXT_TAB)
  })
  globalShortcut.register('CommandOrControl+Shift+Tab', () => {
    mainWindow.webContents.send(PREV_TAB)
  })
  globalShortcut.register('CommandOrControl+W', () => {
    mainWindow.webContents.send(CLOSE_TAB)
  })
}
