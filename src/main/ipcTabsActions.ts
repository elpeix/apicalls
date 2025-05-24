import { ipcMain } from 'electron'
import { TABS } from '../lib/ipcChannels'
import { workspaces } from '.'

ipcMain.on(TABS.update, (_, tabs: RequestTab[]) => {
  const store = workspaces.getStore()
  store.set('tabs', tabs)
})

ipcMain.on(TABS.load, (event) => {
  const store = workspaces.getStore()
  const tabs = store.get('tabs', []) as RequestTab[]
  event.reply(TABS.loadSuccess, tabs)
})
