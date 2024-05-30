import { app, ipcMain } from 'electron'
import { restCall, restCancel } from '../../src/lib/restCaller'
import { RestCallerError } from '../lib/RestCallerError'
import { clearSettings, getSettings, setSettings } from '../lib/settings'
import { REQUEST, SETTINGS, VERSION } from '../lib/ipcChannels'

ipcMain.on(SETTINGS.get, (event) => event.reply(SETTINGS.updated, getSettings()))
ipcMain.on(SETTINGS.save, (_, settings) => setSettings(settings))
ipcMain.on(SETTINGS.clear, (event) => {
  clearSettings()
  event.reply(SETTINGS.updated, getSettings())
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
