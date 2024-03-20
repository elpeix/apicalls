import Store from 'electron-store'

const store = new Store()

export const getSettings = (): AppSettings => {
  const settings = store.get('settings', { theme: 'system', proxy: '' })
  return settings as AppSettings
}

export const setSettings = (settings: AppSettings) => {
  store.set('settings', settings)
}
