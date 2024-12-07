import { app, ipcMain } from 'electron'
import { restCall, restCancel } from '../../src/lib/restCaller'
import { RestCallerError } from '../lib/RestCallerError'
import { clearSettings, getSettings, setSettings } from '../lib/settings'
import { REQUEST, SETTINGS, VERSION } from '../lib/ipcChannels'
import { mainWindow } from '.'

import fs from 'fs'
import * as path from 'path'

let themes: Map<string, AppTheme> = new Map()

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
  event.reply(SETTINGS.updated, getSettings())
})

ipcMain.on(SETTINGS.toggleMenu, (_, showMenu: boolean) => {
  const settings = getSettings()
  setSettings({ ...settings, menu: showMenu })
  mainWindow?.setMenuBarVisibility(showMenu)
})

ipcMain.on(REQUEST.call, async (event, callRequest: CallRequest) => {
  try {
    const response = await restCall(callRequest)
    event.reply(REQUEST.response, response)
  } catch (error: unknown) {
    const restCallerError = error as RestCallerError
    event.reply(REQUEST.failure, {
      message: restCallerError.message,
      request: restCallerError.request,
      response: restCallerError.response
    } as CallResponseFailure)
  }
})

ipcMain.on(REQUEST.cancel, (event, requestId: Identifier) => {
  if (restCancel(requestId)) {
    event.reply(REQUEST.cancelled, requestId)
  }
})

ipcMain.on(VERSION.get, (event) => event.reply(VERSION.getSuccess, app.getVersion()))

const themesDir = path.join(app.getPath('userData'), 'themes')
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
      return [key, JSON.parse(theme) as AppTheme]
    })
  )
}
