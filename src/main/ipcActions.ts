import { app, ipcMain, IpcMainEvent } from 'electron'
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
    event.reply(getChannel(REQUEST.failure, id), {
      message: restCallerError.message,
      request: restCallerError.request,
      response: restCallerError.response
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
