import { ipcMain } from 'electron'
import Store from 'electron-store'
import { TABS_LOAD, TABS_LOAD_SUCCESS, TABS_UPDATE } from '../lib/ipcChannels'

const store = new Store()

ipcMain.on(TABS_UPDATE, (_, tabs: RequestTab[]) => {
  store.set('tabs', tabs)
})

ipcMain.on(TABS_LOAD, (event) => {
  const tabs = store.get('tabs', []) as RequestTab[]
  event.reply(TABS_LOAD_SUCCESS, tabs)
})
