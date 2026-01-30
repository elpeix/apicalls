import { app, ipcMain, IpcMainEvent, dialog } from 'electron'
import { restCall, restCancel } from '../../src/lib/restCaller'
import { RestCallerError } from '../lib/RestCallerError'
import { clearSettings, getSettings, setSettings } from '../lib/settings'
import { ACTIONS, DIALOG, REQUEST, SETTINGS, VERSION, WINDOW_ACTIONS } from '../lib/ipcChannels'
import { mainWindow } from '.'

import fs from 'fs'
import * as path from 'path'

let themes: Map<string, AppTheme> = new Map()

ipcMain.handle(DIALOG.open, async (_, options: Electron.OpenDialogOptions) => {
  if (!mainWindow) return { canceled: true, filePaths: [] }
  return await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], ...options })
})

ipcMain.on(SETTINGS.get, (event) => {
  if (!themes.size) {
    themes = listThemes()
  }
  event.reply(SETTINGS.updated, getSettings())
  event.reply(SETTINGS.listThemes, themes)
})

ipcMain.on(SETTINGS.save, (_, settings) => setSettings(settings))

ipcMain.on(SETTINGS.clear, (event) => {
  clearSettings()
  const settings = getSettings()
  event.reply(SETTINGS.updated, settings)
  mainWindow?.setMenuBarVisibility(!!settings.menu)
  mainWindow?.setAutoHideMenuBar(!settings.menu)
})

ipcMain.on(SETTINGS.toggleMenu, (_, showMenu: boolean) => {
  const settings = getSettings()
  setSettings({ ...settings, menu: showMenu })
  mainWindow?.setMenuBarVisibility(showMenu)
  mainWindow?.setAutoHideMenuBar(!showMenu)
})

ipcMain.on(SETTINGS.importTheme, (event, filePath: string) => {
  try {
    if (!filePath.endsWith('.json')) {
      throw new Error('Only .json files are supported')
    }
    const content = fs.readFileSync(filePath, 'utf8')
    // Validate JSON
    const theme = JSON.parse(content)
    if (
      !theme ||
      typeof theme !== 'object' ||
      typeof theme.name !== 'string' ||
      typeof theme.mode !== 'string' ||
      typeof theme.colors !== 'object' ||
      !theme.colors ||
      typeof theme.editor !== 'object' ||
      !theme.editor
    ) {
      throw new Error('Invalid theme format')
    }
    const fileName = path.basename(filePath)

    // Prevent overwriting bundled themes
    if (fs.existsSync(path.join(bundledThemesPath, fileName))) {
      throw new Error('Cannot overwrite system themes')
    }

    fs.copyFileSync(filePath, path.join(themesDir, fileName))
    themes = listThemes()
    event.reply(SETTINGS.listThemes, themes)

    const themeKey = fileName.replace('.json', '')
    event.reply(SETTINGS.importThemeSuccess, themeKey)
  } catch (e) {
    console.error('Failed to import theme', e)
    event.reply(SETTINGS.importThemeFailure, e instanceof Error ? e.message : 'Unknown error')
  }
})

ipcMain.on(SETTINGS.deleteTheme, (event, themeName: string) => {
  try {
    const filePath = path.join(themesDir, `${themeName}.json`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    themes = listThemes()
    event.reply(SETTINGS.listThemes, themes)
  } catch (e) {
    console.error('Failed to delete theme', e)
  }
})

const requests = new Map<
  Identifier,
  (id: Identifier, callRequest: CallRequest, event: IpcMainEvent) => void
>()
ipcMain.on(REQUEST.call, async (event, callRequest: CallRequest) => {
  if (!callRequest.id) {
    event.reply(REQUEST.failure, {
      message: 'Request ID is required',
      request: callRequest,
      response: null
    } as CallResponseFailure)
    return
  }
  const id = callRequest.id as Identifier
  if (requests.has(id)) {
    event.reply(getChannel(REQUEST.cancel, id), id)
    requests.delete(id)
  }
  requests.set(id, requestHandler)
  requests.get(id)?.(id, callRequest, event)
})

const requestHandler = async (id: Identifier, callRequest: CallRequest, event: IpcMainEvent) => {
  try {
    const response = await restCall(id, callRequest)
    event.reply(getChannel(REQUEST.response, id), response)
  } catch (error: unknown) {
    const restCallerError = error as RestCallerError
    const cause = restCallerError.error?.cause

    event.reply(getChannel(REQUEST.failure, id), {
      message: restCallerError.message,
      request: restCallerError.request,
      response: restCallerError.response,
      error: restCallerError.error,
      cause: cause instanceof Error ? cause.message : String(cause)
    } as CallResponseFailure)
  }
}

ipcMain.on(REQUEST.cancel, (event, requestId: Identifier) => {
  if (requests.has(requestId) && restCancel(requestId)) {
    event.reply(getChannel(REQUEST.cancelled, requestId), requestId)
  }
})

const getChannel = (channel: string, id: Identifier = ''): string => `${channel}-${id}`

ipcMain.on(VERSION.get, (event) => event.reply(VERSION.getSuccess, app.getVersion()))

const themesDir = path.join(app.getPath('userData'), 'themes')
const bundledThemesPath = path.join(app.getAppPath(), 'themes')

const listThemes = (): Map<string, AppTheme> => {
  const files = fs
    .readdirSync(themesDir)
    .filter((file) => {
      return file.endsWith('.json') && file !== 'version.json'
    })
    .sort()
  return new Map(
    files.map((file) => {
      const theme = fs.readFileSync(path.join(themesDir, file), 'utf8')
      const key = file.replace('.json', '')
      const isCustom = !fs.existsSync(path.join(bundledThemesPath, file))
      const appTheme = JSON.parse(theme) as AppTheme
      appTheme.isCustom = isCustom
      return [key, appTheme]
    })
  )
}

ipcMain.on(ACTIONS.setTitle, (_, title: string) => {
  mainWindow?.setTitle(title || 'Api Calls')
})

ipcMain.on(WINDOW_ACTIONS.minimize, () => {
  mainWindow?.minimize()
})

ipcMain.on(WINDOW_ACTIONS.maximize, (event) => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize()
    event.reply(WINDOW_ACTIONS.maximized, false)
  } else {
    mainWindow?.maximize()
    event.reply(WINDOW_ACTIONS.maximized, true)
  }
})

ipcMain.on(WINDOW_ACTIONS.isMaximized, (event) => {
  event.reply(WINDOW_ACTIONS.maximized, mainWindow?.isMaximized())
})

ipcMain.on(WINDOW_ACTIONS.close, () => {
  mainWindow?.close()
})

ipcMain.on(WINDOW_ACTIONS.relaunch, () => {
  app.relaunch()
  app.exit()
})
