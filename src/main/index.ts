import { app, shell, BrowserWindow, nativeTheme, Menu, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import { registerShortcuts } from './shortcutActions'
import { getMenu } from './menu'
import { defaultSettings } from '../lib/defaults'
import { checkAndUpdateThemes } from './themes'

const icon = join(__dirname, '../../resources/icon.png')
let mainWindow: BrowserWindow | null

function createWindow(settingsStore: Store) {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 560,
    minHeight: 480,
    show: false,
    resizable: true,
    maximizable: true,
    icon,
    title: 'API Calls',
    titleBarStyle: getTitleBarStyle(settingsStore),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      spellcheck: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then(() => mainWindow?.maximize())
  } else {
    mainWindow
      .loadFile(join(__dirname, '../renderer/index.html'))
      .then(() => mainWindow?.maximize())
  }

  mainWindow?.on('maximize', () => {
    mainWindow?.webContents.send(WINDOW_ACTIONS.maximized, true)
  })
  mainWindow?.on('unmaximize', () => {
    mainWindow?.webContents.send(WINDOW_ACTIONS.maximized, false)
  })

  registerShortcuts(mainWindow)

  // Set application menu
  const settings = settingsStore.get('settings', defaultSettings) as AppSettingsType
  const menu = getMenu(mainWindow)
  Menu.setApplicationMenu(menu)
  mainWindow.setMenuBarVisibility(!!settings.menu)
  mainWindow.setAutoHideMenuBar(!settings.menu)

  ipcMain.on(SETTINGS.toggleMenuCookies, (_, show: boolean) => {
    const cookiesMenuItem = menu.getMenuItemById('cookies')
    if (cookiesMenuItem) {
      cookiesMenuItem.visible = show
      Menu.setApplicationMenu(menu)
    }
  })
  mainWindow?.on('enter-full-screen', () => {
    mainWindow?.webContents.send(WINDOW_ACTIONS.fullScreen, true)
  })

  mainWindow?.on('leave-full-screen', () => {
    mainWindow?.webContents.send(WINDOW_ACTIONS.fullScreen, false)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Migrate
  onChangeVersion((previousVersion: string, currentVersion: string) => {
    console.info(`The version has changed: ${previousVersion} -> ${currentVersion}.`)
    if (previousVersion < '0.8.2') {
      backupConfig(previousVersion)
      splitConfig()
    }
  })

  const settingsStore = getSettingsStore()

  // Set dock icon for macOS
  if (process.platform === 'darwin') {
    app.dock?.setIcon(icon)
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.francescrequesens.apicalls')

  // Set file themes
  checkAndUpdateThemes()

  // Set theme source for nativeTheme
  const theme = settingsStore.get('settings.theme', 'system')
  if (theme === 'light') {
    nativeTheme.themeSource = 'light'
  } else if (theme === 'dark') {
    nativeTheme.themeSource = 'dark'
  } else {
    nativeTheme.themeSource = 'system'
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow(settingsStore)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(settingsStore)
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function getTitleBarStyle(settingsStore: Store) {
  const settings = settingsStore.get('settings', defaultSettings) as AppSettingsType
  if (process.platform === 'darwin') {
    return 'hiddenInset'
  }
  if (settings.windowMode === 'native') {
    return 'default'
  }
  return 'hidden'
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
import './ipcActions'
import './ipcCollectionActions'
import './ipcEnvironmentActions'
import './ipcTabsActions'
import './ipcCookiesActions'
import './ipcMenuActions'
import { SETTINGS, WINDOW_ACTIONS } from '../lib/ipcChannels'
import { onChangeVersion } from './versionDetector'
import { backupConfig, splitConfig } from './migrations'
import { getSettingsStore } from '../lib/appStore'

export { mainWindow }
