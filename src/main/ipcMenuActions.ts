import { ACTIONS, MENU_ACTIONS } from '../lib/ipcChannels'
import { ipcMain, shell } from 'electron'
import { mainWindow } from '.'
import { toggleRequestView } from '../lib/settings'

function callback(action: string) {
  return () => {
    mainWindow?.webContents.send(action)
  }
}

// File
ipcMain.on(MENU_ACTIONS.newTab, callback(ACTIONS.newTab))
ipcMain.on(MENU_ACTIONS.closeTab, callback(ACTIONS.closeTab))
ipcMain.on(MENU_ACTIONS.saveRequest, callback(ACTIONS.saveRequest))
ipcMain.on(MENU_ACTIONS.saveAsRequest, callback(ACTIONS.saveAsRequest))

// Actions
ipcMain.on(MENU_ACTIONS.sendRequest, callback(ACTIONS.sendRequest))
ipcMain.on(MENU_ACTIONS.findRequest, callback(ACTIONS.findRequest))
ipcMain.on(MENU_ACTIONS.findTab, callback(ACTIONS.searchTab))

// View
ipcMain.on(MENU_ACTIONS.showCollections, callback(ACTIONS.showCollections))
ipcMain.on(MENU_ACTIONS.showEnvironments, callback(ACTIONS.showEnvironments))
ipcMain.on(MENU_ACTIONS.showHistory, callback(ACTIONS.showHistory))
ipcMain.on(MENU_ACTIONS.showSettings, callback(ACTIONS.showSettings))
ipcMain.on(MENU_ACTIONS.showCookies, callback(ACTIONS.showCookies))
ipcMain.on(MENU_ACTIONS.toggleSidebar, callback(ACTIONS.toggleSidebar))
ipcMain.on(MENU_ACTIONS.toggleRequestPanel, callback(ACTIONS.toggleRequestPanel))
ipcMain.on(MENU_ACTIONS.toggleConsole, callback(ACTIONS.toggleConsole))
ipcMain.on(MENU_ACTIONS.toggleRequestView, () => {
  if (!mainWindow) return
  toggleRequestView(mainWindow)
})

// Window
ipcMain.on(MENU_ACTIONS.submitBug, () => {
  shell.openExternal('https://github.com/elpeix/apicalls/issues/new/choose')
})
ipcMain.on(MENU_ACTIONS.developerTools, () => {
  mainWindow?.webContents.toggleDevTools()
})
ipcMain.on(MENU_ACTIONS.reload, () => {
  mainWindow?.webContents.reload()
})
ipcMain.on(MENU_ACTIONS.forceReload, () => {
  mainWindow?.webContents.reloadIgnoringCache()
})
ipcMain.on(MENU_ACTIONS.resetZoom, () => {
  mainWindow?.webContents.setZoomFactor(1)
})
ipcMain.on(MENU_ACTIONS.zoomIn, () => {
  if (!mainWindow) return
  const zoomFactor = mainWindow.webContents.getZoomFactor()
  if (zoomFactor >= 3) return
  mainWindow.webContents.setZoomFactor(zoomFactor + 0.2)
})
ipcMain.on(MENU_ACTIONS.zoomOut, () => {
  if (!mainWindow) return
  const zoomFactor = mainWindow.webContents.getZoomFactor()
  if (zoomFactor <= 0.2) return
  mainWindow.webContents.setZoomFactor(zoomFactor - 0.2)
})
