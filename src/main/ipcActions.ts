import { ipcMain } from 'electron'
import Store from 'electron-store'
import { restCall } from '../../src/lib/restCaller'
import {
  CALL_API,
  CALL_API_FAILURE,
  CALL_API_RESPONSE,
  GET_SETTINGS,
  SAVE_SETTINGS,
  SETTINGS_UPDATED
} from '../lib/ipcChannels'

const store = new Store()

ipcMain.on(GET_SETTINGS, (event) => {
  event.reply(SETTINGS_UPDATED, store.get('settings', { theme: 'system', proxy: '' }))
})

ipcMain.on(SAVE_SETTINGS, (_, settings) => store.set('settings', settings))

ipcMain.on(CALL_API, async (event, callRequest: CallRequest) => {
  try {
    const response = await restCall(callRequest)
    event.reply(CALL_API_RESPONSE, response)
  } catch (error) {
    event.reply(CALL_API_FAILURE, error)
  }
})
