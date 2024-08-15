export const COLLECTIONS = {
  get: 'collections:get',
  create: 'collections:create',
  update: 'collections:update',
  updateAll: 'collections:updateAll',
  remove: 'collections:remove',
  updated: 'collections:updated',
  getFailure: 'collections:get-failure',
  import: 'collections:import',
  importSuccess: 'collections:import-success',
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
  updated: 'settings:updated'
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

export const ACTIONS = {
  newTab: 'action:new-tab',
  nextTab: 'action:next-tab',
  prevTab: 'action:prev-tab',
  closeTab: 'action:close-tab',
  toggleSidebar: 'action:toggle-sidebar',
  sendRequest: 'action:send-request',
  saveRequest: 'action:save-request',
  saveAsRequest: 'action:save-as-request',
  toggleRequestPanel: 'action:toggle-request-panel',
  toggleConsole: 'action:toggle-console',
  escape: 'action:escape'
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
