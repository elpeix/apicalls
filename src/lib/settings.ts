import Store from 'electron-store'

const store = new Store()

export const defaultSettings: AppSettings = {
  theme: 'system',
  timeout: 30000,
  maxHistory: 100,
  proxy: ''
}

export const getSettings = (): AppSettings => {
  return store.get('settings', defaultSettings) as AppSettings
}

export const setSettings = (settings: AppSettings) => {
  store.set('settings', settings)
}

export const clearSettings = () => {
  setSettings(defaultSettings)
}
