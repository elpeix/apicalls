export const COLLECTIONS = {
  get: 'collections:get',
  create: 'collections:create',
  update: 'collections:update',
  updateAll: 'collections:updateAll',
  remove: 'collections:remove',
  updated: 'collections:updated',
  getFailure: 'collections:get-failure',
  import: 'collections:import',
  importFailure: 'collections:import-failure',
  importCanceled: 'collections:import-canceled',
  importProgress: 'collections:import-progress',
  importResult: 'collections:import-result'
}

export const REQUEST = {
  call: 'request:call',
  cancel: 'request:cancel',
  failure: 'request:failure',
  response: 'request:response',
  cancelled: 'request:cancelled'
}

export const SETTINGS = {
  get: 'settings:get',
  save: 'settings:save',
  clear: 'settings:clear',
  updated: 'settings:updated',
  toggleMenu: 'settings:toggle-menu',
  toggleMenuCookies: 'settings:toggle-menu-cookies',
  listThemes: 'settings:list-themes'
}

export const ENVIRONMENTS = {
  get: 'environments:get',
  create: 'environments:create',
  update: 'environments:update',
  updateAll: 'environments:update-all',
  remove: 'environments:remove',
  updated: 'environments:updated',
  getFailure: 'environments:get-failure'
}

export const COOKIES = {
  get: 'cookies:get',
  loaded: 'cookies:loaded',
  set: 'cookies:set'
}

export const ACTIONS = {
  newTab: 'action:new-tab',
  nextTab: 'action:next-tab',
  prevTab: 'action:prev-tab',
  closeTab: 'action:close-tab',
  searchTab: 'action:search-tab',
  restoreTab: 'action:restore-tab',
  toggleSidebar: 'action:toggle-sidebar',
  findRequest: 'action:find-request',
  sendRequest: 'action:send-request',
  saveRequest: 'action:save-request',
  saveAsRequest: 'action:save-as-request',
  toggleRequestPanel: 'action:toggle-request-panel',
  toggleConsole: 'action:toggle-console',
  escape: 'action:escape',
  showSettings: 'action:show-settings',
  showCollections: 'action:show-collections',
  showEnvironments: 'action:show-environments',
  showHistory: 'action:show-history',
  showCookies: 'action:show-cookies'
}

export const TABS = {
  update: 'tabs:update',
  load: 'tabs:load',
  loadSuccess: 'tabs:load-success'
}

export const VERSION = {
  get: 'version:get',
  getSuccess: 'version:get-success'
}
