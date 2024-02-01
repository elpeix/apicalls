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

type RequestBase = {
  url: string
  method: Method
  headers: KeyValue[]
  params: KeyValue[]
  body?: string
}

type RequestType = {
  type: 'draft' | 'history' | 'collection'
  id: Identifier
  name?: string
  date?: string
  request: RequestBase
}

type Tab = RequestType & {
  active: boolean
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
  elements: (CollectionFolder | RequestType)[]
}

type Collection = {
  id: Identifier
  name: string
  preRequestData?: PreRequestData
  elements: (CollectionFolder | RequestType)[]
}

type HistoryHook = {
  getAll: () => RequestType[]
  add: (request: RequestType) => void
  remove: (id: string) => void
  clear: () => void
  get: (id: Identifier) => RequestType | undefined
}

type TabsHook = {
  openTab: (itemRequest: RequestType) => void
  newTab: (itemRequest?: RequestType) => void
  addTab: (tab: Tab) => void
  removeTab: (tabId: Identifier) => void
  updateTab: (tabId: Identifier, tab: Tab) => void
  updateTabRequest: (tabId: Identifier, request: RequestBase) => void
  hasTabs: () => boolean
  getTab: (tabId: Identifier) => Tab | undefined
  getTabs: () => Tab[]
  setActiveTab: (index: number) => void
  getSelectedTabIndex: () => number
}

type RequestLog = {
  method: string
  url: string
  status: number
  time: number
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

type RequestContextRequest = {
  methods: Method[]
  method: Method
  url: string
  body: string
  headers: KeyValue[]
  params: KeyValue[]
  setMethod: (method: Method) => void
  setUrl: (url: string) => void
  setBody: (body: string) => void
  setHeaders: (headers: KeyValue[]) => void
  setParams: (params: KeyValue[]) => void
  addParam: () => void
  removeParam: (index: number) => void
  getActiveParamsLength: () => number
  addHeader: () => void
  removeHeader: (index: number) => void
  getActiveHeadersLength: () => number
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
  id: Identifier
  url: string
  method?: string
  queryParams?: KeyValue[]
  headers?: HeadersInit
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
