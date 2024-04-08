import Store from 'electron-store'
import { defaultSettings } from './defaults'

const store = new Store()

export const getSettings = (): AppSettingsType => {
  return store.get('settings', defaultSettings) as AppSettingsType
}

export const setSettings = (settings: AppSettingsType) => {
  store.set('settings', settings)
}

export const clearSettings = () => {
  setSettings(defaultSettings)
}
