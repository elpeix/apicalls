import { ipcMain } from 'electron'
import { COOKIES } from '../lib/ipcChannels'
import { getWorkspaceStore } from '../lib/appStore'

const store = getWorkspaceStore()

const COOKIES_KEY = 'cookies'

ipcMain.on(COOKIES.get, (event) => {
  const cookies = store.get(COOKIES_KEY, []) as Cookie[]
  event.reply(COOKIES.loaded, cookies)
})

ipcMain.on(COOKIES.set, (event, cookies: Cookie[]) => {
  store.set(COOKIES_KEY, cookies)
  event.reply(COOKIES.loaded, cookies)
})
