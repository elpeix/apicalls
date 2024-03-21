import Store from 'electron-store'
import { defaultSettings } from './defaults'

const store = new Store()

export const getSettings = (): AppSettings => {
  return store.get('settings', defaultSettings) as AppSettings
}

export const setSettings = (settings: AppSettings) => {
  store.set('settings', settings)
}

export const clearSettings = () => {
  setSettings(defaultSettings)
}
