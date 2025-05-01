import { ipcMain } from 'electron'
import { TABS } from '../lib/ipcChannels'
import { getWorkspaceStore } from '../lib/appStore'

const store = getWorkspaceStore()

ipcMain.on(TABS.update, (_, tabs: RequestTab[]) => {
  store.set('tabs', tabs)
})

ipcMain.on(TABS.load, (event) => {
  const tabs = store.get('tabs', []) as RequestTab[]
  event.reply(TABS.loadSuccess, tabs)
})
