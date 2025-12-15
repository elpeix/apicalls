import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { is } from '@electron-toolkit/utils'
import { AUTO_UPDATE } from '../lib/ipcChannels'

const supportedPlatforms = new Set<NodeJS.Platform>(['darwin', 'win32'])
const canUseAutoUpdate = supportedPlatforms.has(process.platform)

const { autoUpdater } = createRequire(import.meta.url)(
  'electron-updater'
) as typeof import('electron-updater')

let boundWindow: BrowserWindow | null = null
let listenersRegistered = false
let isInitialized = false
let manualCheckInProgress = false

export function initAutoUpdate(mainWindow: BrowserWindow) {
  boundWindow = mainWindow

  registerIpcHandlers()

  if (!canUseAutoUpdate || is.dev || isInitialized) {
    return
  }

  isInitialized = true

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = console

  autoUpdater.on('update-available', (info) => {
    sendStatus({
      type: 'available',
      version: info.version,
      initiatedByUser: manualCheckInProgress
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    sendStatus({
      type: 'downloading',
      percent: Math.round(progress.percent)
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendStatus({
      type: 'downloaded',
      version: info.version
    })
    manualCheckInProgress = false
  })

  autoUpdater.on('update-not-available', () => {
    sendStatus({
      type: 'not-available',
      initiatedByUser: manualCheckInProgress
    })
    manualCheckInProgress = false
  })

  autoUpdater.on('error', (error) => {
    sendStatus({
      type: 'error',
      initiatedByUser: manualCheckInProgress,
      message: error instanceof Error ? error.message : String(error ?? 'Unknown error')
    })
    manualCheckInProgress = false
  })

  checkForUpdates(false)
}

export function checkForUpdates(manual: boolean) {
  if (!canUseAutoUpdate || is.dev) {
    if (manual) {
      sendStatus({ type: 'not-supported' })
    }
    return
  }

  manualCheckInProgress = manual

  autoUpdater.checkForUpdates().catch((error) => {
    sendStatus({
      type: 'error',
      initiatedByUser: manualCheckInProgress,
      message: error instanceof Error ? error.message : String(error ?? 'Unknown error')
    })
    manualCheckInProgress = false
  })
}

export function installUpdate() {
  if (!canUseAutoUpdate || is.dev) {
    return
  }

  app.removeAllListeners('window-all-closed')

  autoUpdater.autoInstallOnAppQuit = false

  setImmediate(() => {
    autoUpdater.quitAndInstall(false, true)
  })
}

function registerIpcHandlers() {
  if (listenersRegistered) {
    return
  }

  ipcMain.on(AUTO_UPDATE.check, () => {
    checkForUpdates(true)
  })

  ipcMain.on(AUTO_UPDATE.install, () => {
    installUpdate()
  })

  listenersRegistered = true
}

function sendStatus(payload: AutoUpdateStatusPayload) {
  if (!boundWindow || boundWindow.isDestroyed()) {
    boundWindow = BrowserWindow.getAllWindows().find((window) => !window.isDestroyed()) ?? null
  }

  boundWindow?.webContents.send(AUTO_UPDATE.status, payload)
}
