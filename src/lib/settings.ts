import { defaultSettings } from './defaults'
import { SETTINGS } from './ipcChannels'
import { BrowserWindow } from 'electron'
import { StorerFactory } from './appStore'

const store = StorerFactory.getSettingsStore()

export const getSettings = (): AppSettingsType => {
  return store.get('settings', defaultSettings) as AppSettingsType
}

export const setSettings = (settings: AppSettingsType) => {
  store.set('settings', settings)
}

export const clearSettings = () => {
  setSettings(defaultSettings)
}

export const toggleRequestView = (mainWindow: BrowserWindow) => {
  const settings = getSettings()
  settings.requestView = settings.requestView === 'horizontal' ? 'vertical' : 'horizontal'
  setSettings(settings)
  mainWindow.webContents.send(SETTINGS.updated, settings)
}
