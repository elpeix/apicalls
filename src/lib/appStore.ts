import Store from 'electron-store'

export const getSettingsStore = () => getStore('settings')
export const getWorkspaceStore = () => getStore('workspace')
export const getStore = (name: string) => new Store({ name })
