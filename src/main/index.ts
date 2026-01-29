import { app, shell, BrowserWindow, nativeTheme, Menu, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerShortcuts } from './shortcutActions'
import { getMenu } from './menu'
import { defaultSettings } from '../lib/defaults'
import { checkAndUpdateThemes } from './themes'
import { initAutoUpdate } from './autoUpdate'

// Prevent GTK error on Gnome 47+
app.commandLine.appendSwitch('gtk-version', '3')

let mainWindow: BrowserWindow | null

function createWindow(settingsStore: IStore) {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    vibrancy: 'sidebar',
    width: 900,
    height: 670,
    minWidth: 560,
    minHeight: 480,
    show: false,
    resizable: true,
    maximizable: true,
    icon: getIcon(),
    title: 'API Calls',
    titleBarStyle: getTitleBarStyle(settingsStore),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false, // Required for Monaco Editor web workers; contextIsolation provides security
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

  initAutoUpdate(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
import logger from './logger'

// ...

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
})

app.whenReady().then(() => {
  logger.info('Application started')
  // ...
  onChangeVersion((previousVersion: string, currentVersion: string) => {
    logger.info(`The version has changed: ${previousVersion} -> ${currentVersion}.`)
    handleMigrations(previousVersion, currentVersion)
  })

  const settingsStore = StorerFactory.getSettingsStore()

  // Set dock icon for macOS
  if (process.platform === 'darwin') {
    app.dock?.setIcon(getIcon())
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

  // Listen for system theme changes and notify renderer
  nativeTheme.on('updated', () => {
    if (mainWindow) {
      mainWindow.webContents.send(
        SYSTEM_ACTIONS.systemThemeChanged,
        nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
      )
    }
  })

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

function getIcon() {
  if (process.platform === 'darwin') {
    return join(__dirname, '../../resources/icon_darwin.png')
  }
  return join(__dirname, '../../resources/icon.png')
}

function getTitleBarStyle(settingsStore: IStore) {
  const settings = settingsStore.get('settings', defaultSettings) as AppSettingsType
  if (process.platform === 'darwin') {
    return 'hiddenInset'
  }
  if (settings.windowMode === 'native') {
    return 'default'
  }
  return 'hidden'
}

const workspaces = new Workspaces(StorerFactory)

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
import './ipcActions'
import './ipcEnvironmentActions'
import './ipcCollectionActions'
import './ipcWorkspaceActions'
import './ipcMenuActions'
import './ipcCookiesActions'
import './ipcTabsActions'
import './ipcAuthActions'
import { SETTINGS, SYSTEM_ACTIONS, WINDOW_ACTIONS } from '../lib/ipcChannels'
import { onChangeVersion } from './versionDetector'
import { handleMigrations } from './migrations'
import './migrations/migrationsImporter'
import { IStore, StorerFactory } from '../lib/appStore'
import { Workspaces } from '../lib/Workspaces'

export { workspaces, mainWindow }
