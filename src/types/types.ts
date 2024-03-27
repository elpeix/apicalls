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
  headers: KeyValue[]
  pathParams?: KeyValue[]
  queryParams: KeyValue[]
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
  collectionId?: Identifier
  path?: PathItem[]
}

type Environment = {
  id: Identifier
  name: string
  active: boolean
  variables: KeyValue[]
}

type PreRequestData = {
  request: RequestBase
  type: 'authorization' | 'data'
  dataToCapture: {
    type: 'header' | 'body'
    jsonPath: string
  }[]
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
  preRequestData?: PreRequestData
  elements: (CollectionFolder | RequestType)[]
}

type PathItem = {
  id: Identifier
  type: 'folder' | 'request' | 'collection'
}

type HistoryHook = {
  getAll: () => RequestType[]
  add: (request: RequestType) => void
  remove: (id: string) => void
  clear: () => void
  get: (id: Identifier) => RequestType | undefined
}

type TabsHook = {
  openTab: (itemRequest: RequestType, collectionId?: Identifier, path?: PathItem[]) => void
  newTab: (itemRequest?: RequestType, collectionId?: Identifier, path?: PathItem[]) => void
  addTab: (tab: RequestTab) => void
  removeTab: (tabId: Identifier) => void
  updateTab: (tabId: Identifier, tab: RequestTab) => void
  updateTabRequest: (tabId: Identifier, request: RequestBase) => void
  hasTabs: () => boolean
  getTab: (tabId: Identifier) => RequestTab | undefined
  getTabs: () => RequestTab[]
  setActiveTab: (index: number) => void
  getSelectedTabIndex: () => number
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

type ConsoleHook = {
  logs: RequestLog[]
  add: (log: RequestLog) => void
  clear: () => void
}

type CollectionsHook = {
  setCollections: (collections: Collection[]) => void
  create: () => Collection
  add: (collection: Collection) => void
  remove: (id: Identifier) => void
  update: (collection: Collection) => void
  clear: () => void
  getAll: () => Collection[]
  get: (id: Identifier) => Collection | undefined
  addPreRequestData: (collectionId: Identifier, preRequestData: PreRequestData) => void
  removePreRequestData: (collectionId: Identifier) => void
  saveRequest: (saveRequest: SaveRequest) => void
}

type EnvironmentsHook = {
  setEnvironments: (environments: Environment[]) => void
  create: () => Environment
  add: (environment: Environment) => void
  remove: (id: Identifier) => void
  update: (environment: Environment) => void
  clear: () => void
  getAll: () => Environment[]
  get: (id: Identifier) => Environment | undefined
  getActive: () => Environment | undefined
  active: (id: Identifier) => void
  deactive: () => void
  variableIsDefined: (name: string) => boolean
  replaceVariables: (value: string) => string
  getVariableValue: (name: string) => string
}

type MenuItem = {
  id: Identifier
  title?: string
  spacer?: boolean
}

type MenuHook = {
  items: MenuItem[]
  selected: MenuItem
  select: (id: Identifier) => void
}

type RequestItem = {
  items: KeyValue[]
  set: (item: KeyValue[]) => void
  add: () => void
  remove: (index: number) => void
  getActiveLength: () => number
}

type RequestContextRequest = {
  methods: Method[]
  method: Method
  url: string
  body: string
  auth: RequestAuth
  headers: RequestItem
  queryParams: RequestItem
  pathParams?: RequestItem
  setMethod: (method: Method) => void
  setUrl: (url: string) => void
  setFullUrl: (url: string) => void
  setBody: (body: string) => void
  setAuth: (auth: RequestAuth) => void
  fetch: () => void
  urlIsValid: ({ url }: { url?: string }) => boolean
}

type Theme = 'light' | 'dark' | 'system'

type AppSettings = {
  theme: Theme
  proxy: string
  maxHistory: number
  timeout: number
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
  message: string
  request: CallRequest
  response: CallResponse | null
}

type SaveRequest = {
  path: PathItem[]
  collectionId: Identifier
  request: RequestType
}
