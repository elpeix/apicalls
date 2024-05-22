import { ipcMain } from 'electron'
import Store from 'electron-store'
import { TABS } from '../lib/ipcChannels'

const store = new Store()

ipcMain.on(TABS.update, (_, tabs: RequestTab[]) => {
  store.set('tabs', tabs)
})

ipcMain.on(TABS.load, (event) => {
  const tabs = store.get('tabs', []) as RequestTab[]
  event.reply(TABS.loadSuccess, tabs)
})
