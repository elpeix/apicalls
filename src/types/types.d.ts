type Identifier = number | string

type Method = {
  value: string
  label: string
  body: boolean
}

type KeyValue = {
  name: string
  value: string
  enabled?: boolean
  toBeRemoved?: boolean
}

type RequestAuthType = 'none' | 'bearer' | 'basic'
type RequestAuthBearer = string
type RequestAuthBasic = { username: string; password: string }
type RequestAuthValue = RequestAuthBearer | RequestAuthBasic | null | undefined
type RequestAuth = {
  type: RequestAuthType
  value?: RequestAuthValue
}

type ContentTypes = 'json' | 'xml' | 'text' | 'none'
type BodyType =
  | {
      contentType: Exclude<ContentTypes, 'none'>
      value: string
    }
  | ''
  | 'none'

type RequestBase = {
  url: string
  method: Method
  auth?: RequestAuth
  headers?: KeyValue[]
  pathParams?: KeyValue[]
  queryParams?: KeyValue[]
  body?: BodyType
}

type RequestType = {
  type: 'draft' | 'history' | 'collection'
  id: Identifier
  name?: string
  description?: string
  date?: string
  request: RequestBase
}

type RequestTab = RequestType & {
  active: boolean
  saved?: boolean
  collectionId?: Identifier
  path?: PathItem[]
  response?: RequestResponseType
}

type FetchedType = true | false | 'old'

type ActiveRequest = {
  collectionId: Identifier
  path: PathItem[]
  id: Identifier
}

type ClosedTab = RequestTab & {
  index: number
}

type Environment = {
  id: Identifier
  name: string
  active: boolean
  variables: KeyValue[]
}

type PreRequestDataToCaptureType = 'header' | 'body'

type PreRequestDataToCapture = {
  id: Identifier
  type: PreRequestDataToCaptureType
  path: string
  setEnvironmentVariable: string
}

type PreRequest = {
  request: RequestBase
  type: 'authorization' | 'data'
  dataToCapture: PreRequestDataToCapture[]
  active?: boolean
}

type CollectionFolder = {
  id: Identifier
  type: 'folder'
  name: string
  expanded?: boolean
  elements: (CollectionFolder | RequestType)[]
}

type Collection = {
  id: Identifier
  name: string
  description?: string
  preRequest?: PreRequest
  elements: (CollectionFolder | RequestType)[]
  environmentId?: Identifier
}

type FlatRequest = RequestType & {
  collectionId: Identifier
  collectionName: string
  folderId: Identifier
  folderPath: string
  path: PathItem[]
  filter: string
  filterPositions: number[]
}

type PathItem = {
  id: Identifier
  type: 'folder' | 'request' | 'collection'
}

type HistoryHookType = {
  getAll: () => RequestType[]
  add: (request: RequestType) => void
  remove: (id: string) => void
  clear: () => void
  get: (id: Identifier) => RequestType | undefined
}

type OpenTabArguments = {
  request: RequestType
  collectionId?: Identifier
  path?: PathItem[]
  shiftKey?: boolean
}

type TabsHookType = {
  initTabs: (tabs: RequestTab[]) => void
  openTab: (args: OpenTabArguments) => void
  newTab: (itemRequest?: RequestType, collectionId?: Identifier, path?: PathItem[]) => void
  addTab: (tab: RequestTab) => void
  duplicateTab: (tabId: Identifier) => void
  removeTab: (tabId: Identifier, force?: boolean) => void
  updateTab: (tabId: Identifier, tab: RequestTab) => void
  updateTabRequest: (tabId: Identifier, saved: boolean, request: RequestBase) => void
  restoreTab: () => void
  closeOtherTabs: (tabId: Identifier, force?: boolean) => void
  closeAllTabs: (force?: boolean) => void
  saveTab: (tabId: Identifier) => void
  hasTabs: () => boolean
  getTab: (tabId: Identifier) => RequestTab | undefined
  getTabs: () => RequestTab[]
  setActiveTab: (index: number) => void
  getSelectedTabIndex: () => number
  getActiveRequest: () => ActiveRequest | null
  highlightCollectionRequest: (tab: RequestTab) => void
  renameTab: (tabId: Identifier, name: string) => void
  moveTab: (tabId: Identifier, toBeforeTabId: Identifier) => void
  tabs: RequestTab[]
  updatePaths: (collectionId: Identifier, from: PathItem[], to: PathItem[]) => void
}

type RequestLog = {
  method: string
  url: string
  status: number
  time: number
  request?: CallRequest
  response?: CallResponse
  failure?: CallResponseFailure
}

type ConsoleHookType = {
  logs: RequestLog[]
  add: (log: RequestLog) => void
  addAll: (logs: RequestLog[]) => void
  clear: () => void
}

type CollectionsHookType = {
  setCollections: (collections: Collection[]) => void
  create: () => Collection
  add: (collection: Collection) => void
  remove: (id: Identifier) => void
  update: (collection: Collection) => void
  clear: () => void
  move: (id: Identifier, toBeforeId: Identifier) => void
  getAll: () => Collection[]
  get: (id: Identifier) => Collection | undefined
  setPreRequest: (collectionId: Identifier, preRequestData: PreRequest) => void
  clearPreRequest: (collectionId: Identifier) => void
  saveRequest: (saveRequest: SaveRequest) => void
  updateTime: number
  getEnvironmentId: (collectionId: Identifier) => Identifier | undefined
  setEnvironmentId: (collectionId: Identifier, environmentId?: Identifier) => void
  selectedCollection: Collection | null
  select: (collectionId: Identifier | null) => void
}

type EnvironmentsHookType = {
  setEnvironments: (environments: Environment[]) => void
  create: () => Environment
  add: (environment: Environment) => void
  remove: (id: Identifier) => void
  update: (environment: Environment) => void
  duplicate: (id: Identifier) => void
  clear: () => void
  move: (id: Identifier, toBeforeId: Identifier) => void
  getAll: () => Environment[]
  get: (id: Identifier) => Environment | undefined
  getActive: () => Environment | undefined
  active: (id: Identifier) => void
  deactive: () => void
  variableIsDefined: (id: Identifier, name: string) => boolean
  replaceVariables: (id: Identifier, value: string) => string
  getVariableValue: (id: Identifier, name: string) => string
  getVariables: (id?: Identifier) => KeyValue[]
  hasItems: () => boolean
}

type MenuItem = {
  id: Identifier
  title?: string
  spacer?: boolean
}

type MenuHookType = {
  items: MenuItem[]
  selected: MenuItem
  select: (id: Identifier) => void
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  selectAndExpand: (id: Identifier) => void
}

type Cookie = {
  name: string
  value: string
  domain: string
  expires: Date
  httpOnly: boolean
  path: string
  sameSite: string
  secure?: boolean
}

type CookiesHookType = {
  set: (cookies: Cookie[]) => void
  upsert: (headers: KeyValue[], defaultGroup: string) => void
  remove: (url: string) => void
  clear: () => void
  getAll: () => Cookies[]
  getGroups: () => string[]
  getGrouped: () => Map<string, Cookie[]>
  updateGroup: (group: string, cookies: Cookie[]) => void
  get: (url: string) => Cookies[]
  stringify: (url: string) => string
}

type AppSettingsHookType = {
  settings: AppSettingsType | null
  isCustomWindowMode: () => boolean
  save: (settings: AppSettingsType) => void
  clear: () => void
  themes: Map<string, AppTheme>
  getEditorTheme: () => {
    name: string
    mode: string
    data: data
  }
}

type RequestItem = {
  items: KeyValue[]
  set: (item: KeyValue[]) => void
  add?: () => void
  remove: (index: number) => void
  getActiveLength: () => number
}

type RequestContextRequestType = {
  method: Method
  url: string
  body: BodyType
  auth: RequestAuth
  headers: RequestItem
  queryParams: RequestItem
  pathParams: RequestItem
  setMethod: (method: Method) => void
  setUrl: (url: string) => void
  setFullUrl: (url: string) => void
  getFullUrl: () => string
  setBody: (body: BodyType) => void
  setAuth: (auth: RequestAuth) => void
  fetch: () => void
  cancel: () => void
  urlIsValid: ({ url }: { url?: string }) => boolean
}

type RequestResponseType = {
  body: string
  headers: KeyValue[]
  cookies: string[][]
  status: number
  time: number
  size: number
}
type RequestContextType = {
  path: PathItem[]
  isActive: boolean
  collectionId?: Identifier | null
  request: RequestContextRequestType | null
  fetching: boolean
  fetched: FetchedType
  fetchError: string
  fetchErrorCause: string
  response: RequestResponseType
  save: () => void
  requestConsole?: ConsoleHookType | null
  tabId?: Identifier
  openSaveAs?: boolean
  setOpenSaveAs?: (openSaveAs: boolean) => void
  setEditorState: (type: 'request' | 'response', state: string) => void
  getEditorState: (type: 'request' | 'response') => string
  getRequestEnvironment: () => Environment | null
  copyAsCurl: () => void
  pasteCurl: (curl: string) => void
}

type AppTheme = {
  name: string
  mode: string
  colors: {
    [key: string]: string
  }
  editor: {
    base: string
  }
}

type AppSettingsRequestView = 'horizontal' | 'vertical'
type AppSettingsWindowMode = 'native' | 'custom'
type AppSettingsType = {
  theme: string
  proxy: string
  maxHistory: number
  timeout: number
  manageCookies?: boolean
  menu?: boolean
  requestView?: AppSettingsRequestView
  scrollToActiveRequest?: boolean
  confirmCloseUnsavedTab?: boolean
  windowMode?: AppSettingsWindowMode
  showNotification?: boolean
  defaultHeaders?: KeyValue[]
  saveLastResponse?: boolean
  rejectUnauthorized?: boolean
  followRequestRedirect?: boolean
}

type CallRequest = {
  id?: Identifier
  url: string
  method?: Method
  headers?: HeadersInit
  queryParams?: KeyValue[]
  body?: string
}

type CallResponse = {
  id: Identifier
  result: string | undefined
  status: {
    code: number
    text: string
  }
  contentLength: number
  responseTime: {
    all: number
    data: number
    response: number
  }
  responseHeaders: KeyValue[]
}

type CallResponseFailure = {
  requestId?: Identifier
  message: string
  request: CallRequest
  response: CallResponse | null
  error?: Error | null
  cause?: string
}

type SaveRequest = {
  path: PathItem[]
  collectionId: Identifier
  request: RequestType
}

type WindowAPI = {
  os: {
    isWindows: boolean
    isMac: boolean
    isLinux: boolean
  }
}

type NotifcationTtype = {
  message: string
}

type WorkspaceType = {
  id: Identifier
  name: string
  selected?: boolean
}

type WorkspacesHookType = {
  workspaces: WorkspaceType[]
  selectedWorkspace: WorkspaceType | null
  create: (name: string) => void
  duplicate: (id: Identifier) => void
  update: (id: Identifier, name: string) => void
  remove: (id: Identifier) => void
  select: (id: Identifier) => void
  reload: () => void
}

type ApplicationType = {
  showDialog: (dialogProps: DialogType) => void
  hideDialog: () => void
  showAlert: (alertProps: AlertType) => void
  hideAlert: () => void
  showPrompt: (promptProps: PromptType) => void
  hidePrompt: () => void
  showConfirm: (confirmProps: ConfirmType) => void
  hideConfirm: () => void
  dialogIsOpen: boolean
  notify: ({ message }: NotifcationTtype) => void
  tabActions: {
    revealRequest: (tab: RequestTab) => void
    closeTab: (tab: RequestTab) => void
    closeAllTabs: () => void
    closeOtherTabs: (tab: RequestTab) => void
  }
  version: string
}

type DialogType = {
  children: React.ReactNode
  className?: string
  onClose?: () => void
  preventKeyClose?: boolean
  position?: 'top' | 'center'
  fullWidth?: boolean
}

type AlertType = {
  message: string
  buttonName?: string
  buttonColor?: 'primary' | 'danger'
  onClose?: () => void
}

type PromptType = {
  message: string
  confirmName?: string
  placeholder?: string
  value?: string
  valueSelected?: boolean
  onConfirm: (value: string) => void
  onCancel: () => void
}

type ConfirmType = {
  message: string
  confirmName?: string
  confirmColor?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

type YesNoType = {
  message: string
  yesName?: string
  noName?: string
  yesColor?: 'primary' | 'danger'
  noColor?: 'primary' | 'danger'
  onYes: () => void
  onNo: () => void
  onCancel: () => void
}

type MoveAction = {
  from: PathItem[]
  to: PathItem[]
  after?: Identifier
}

type ImportExportFormat = 'JSON' | 'OpenAPI' | 'Postman'
