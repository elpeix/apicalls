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

type RequestAuth = {
  type: RequestAuthType
  value?: string
}

type RequestBase = {
  url: string
  method: Method
  auth?: RequestAuth
  headers?: KeyValue[]
  pathParams?: KeyValue[]
  queryParams?: KeyValue[]
  body?: string
}

type RequestType = {
  type: 'draft' | 'history' | 'collection'
  id: Identifier
  name?: string
  date?: string
  request: RequestBase
}

type RequestTab = RequestType & {
  active: boolean
  saved?: boolean
  collectionId?: Identifier
  path?: PathItem[]
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
  preRequest?: PreRequest
  elements: (CollectionFolder | RequestType)[]
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
  setTabs: (tabs: RequestTab[]) => void
  openTab: (args: OpenTabArguments) => void
  newTab: (itemRequest?: RequestType, collectionId?: Identifier, path?: PathItem[]) => void
  addTab: (tab: RequestTab) => void
  removeTab: (tabId: Identifier) => void
  updateTab: (tabId: Identifier, tab: RequestTab) => void
  updateTabRequest: (tabId: Identifier, saved: boolean, request: RequestBase) => void
  hasTabs: () => boolean
  getTab: (tabId: Identifier) => RequestTab | undefined
  getTabs: () => RequestTab[]
  setActiveTab: (index: number) => void
  getSelectedTabIndex: () => number
  renameTab: (tabId: Identifier, name: string) => void
  moveTab: (tabId: Identifier, toBeforeTabId: Identifier) => void
  tabs: RequestTab[]
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
  variableIsDefined: (name: string) => boolean
  replaceVariables: (value: string) => string
  getVariableValue: (name: string) => string
  getVariables: (id?: Identifier) => KeyValue[]
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
}

type OriginCookies = {
  origin: string
  cookies: string[]
}

type CookiesHookType = {
  upsert: (origin: string, cookies: string[]) => void
  remove: (origin: string) => void
  clear: () => void
  getAll: () => OriginCookies[]
  get: (origin: string) => OriginCookies | undefined
}

type AppSettingsHookType = {
  settings: AppSettingsType | null
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
  body: string
  auth: RequestAuth
  headers: RequestItem
  queryParams: RequestItem
  pathParams: RequestItem
  setMethod: (method: Method) => void
  setUrl: (url: string) => void
  setFullUrl: (url: string) => void
  setBody: (body: string) => void
  setAuth: (auth: RequestAuth) => void
  fetch: () => void
  cancel: () => void
  urlIsValid: ({ url }: { url?: string }) => boolean
}

type RequestContextResponseType = {
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
  fetched: boolean
  fetchError: string
  response: RequestContextResponseType
  save: () => void
  requestConsole?: ConsoleHookType | null
  tabId?: Identifier
  openSaveAs?: boolean
  setOpenSaveAs?: (openSaveAs: boolean) => void
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
type AppSettingsType = {
  theme: string // TODO: AppTheme
  proxy: string
  maxHistory: number
  timeout: number
  manageCookies?: boolean
  menu?: boolean
  requestView?: AppSettingsRequestView
}

type CallRequest = {
  id?: Identifier
  url: string
  method?: string
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

type ApplicationType = {
  showDialog: (dialogProps: DialogType) => void
  hideDialog: () => void
  showPrompt: (promptProps: PromptType) => void
  hidePrompt: () => void
  showConfirm: (confirmProps: ConfirmType) => void
  hideConfirm: () => void
}

type DialogType = {
  children: React.ReactNode
  className?: string
  onClose?: () => void
  preventKeyClose?: boolean
  position?: 'top' | 'center'
}

type PromptType = {
  message: string
  confirmName?: string
  placeholder?: string
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
