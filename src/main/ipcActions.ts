import { ipcMain } from 'electron'
import { restCall } from '../../src/lib/restCaller'
import { RestCallerError } from '../lib/RestCallerError'
import { clearSettings, getSettings, setSettings } from '../lib/settings'
import {
  CALL_API,
  CALL_API_FAILURE,
  CALL_API_RESPONSE,
  GET_SETTINGS,
  SAVE_SETTINGS,
  SETTINGS_UPDATED,
  CLEAR_SETTINGS
} from '../lib/ipcChannels'

ipcMain.on(GET_SETTINGS, (event) => event.reply(SETTINGS_UPDATED, getSettings()))
ipcMain.on(SAVE_SETTINGS, (_, settings) => setSettings(settings))
ipcMain.on(CLEAR_SETTINGS, (event) => {
  clearSettings()
  event.reply(SETTINGS_UPDATED, getSettings())
})

ipcMain.on(CALL_API, async (event, callRequest: CallRequest) => {
  try {
    const response = await restCall(callRequest)
    event.reply(CALL_API_RESPONSE, response)
  } catch (error: unknown) {
    const restCallerError = error as RestCallerError
    event.reply(CALL_API_FAILURE, {
      message: restCallerError.message,
      request: restCallerError.request,
      response: restCallerError.response
    } as CallResponseFailure)
  }
})
