export const defaultSettings: AppSettingsType = {
  theme: 'system',
  timeout: 30000,
  maxHistory: 100,
  proxy: '',
  manageCookies: false,
  menu: true,
  requestView: 'horizontal',
  scrollToActiveRequest: true,
  confirmCloseUnsavedTab: true,
  windowMode: 'custom',
  showNotification: true,
  defaultUserAgent: ''
}

export const getGeneralDefaultUserAgent = (version: string) => {
  return `Api-Calls/${version} (${window.api.os.platform}; ${window.api.os.arch})`
}
