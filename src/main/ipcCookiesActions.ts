import { ipcMain } from 'electron'
import { COOKIES } from '../lib/ipcChannels'
import { workspaces } from '.'

const COOKIES_KEY = 'cookies'

ipcMain.on(COOKIES.get, (event) => {
  const store = workspaces.getStore()
  const cookies = store.get(COOKIES_KEY, []) as Cookie[]
  event.reply(COOKIES.loaded, cookies)
})

ipcMain.on(COOKIES.set, (event, cookies: Cookie[]) => {
  const store = workspaces.getStore()
  store.set(COOKIES_KEY, cookies)
  event.reply(COOKIES.loaded, cookies)
})
