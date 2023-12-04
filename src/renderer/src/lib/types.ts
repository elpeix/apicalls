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
  id: number | string
  name?: string
  request: RequestBase
}

type RequestDraft = RequestType & {
  type: 'draft'
}

type RequestHistory = RequestType & {
  type: 'history'
  date: string
}

type RequestCollection = RequestType & {
  type: 'collection'
}

type Tab = (RequestDraft | RequestHistory | RequestCollection) & {
  active: boolean
}

type Environment = {
  id: number | string
  name: string
  active: boolean
  variables: KeyValue[]
}

type CollectionFolder = {
  type: 'folder'
  name: string
  elements: (RequestCollection | CollectionFolder)[]
}

type Collection = {
  id: number | string
  name: string
  elements: (CollectionFolder | RequestCollection)[]
}

type HistoryHook = {
  getAll: () => RequestHistory[]
  add: (request: RequestHistory) => void
  remove: (id: string) => void
  clear: () => void
  get: (id: number | string) => RequestHistory | undefined
}

type RequestLog = {
  method: string
  url: string
  status: number
  time: number
}

type CollectionsHook = {
  create: () => Collection
  add: (collection: Collection) => void
  remove: (id: number | string) => void
  update: (collection: Collection) => void
  clear: () => void
  getAll: () => Collection[]
  get: (id: number | string) => Collection | undefined
}

type EnvironmentsHook = {
  create: () => Environment
  add: (environment: Environment) => void
  remove: (id: number | string) => void
  update: (environment: Environment) => void
  clear: () => void
  getAll: () => Environment[]
  get: (id: number | string) => Environment | undefined
  getActive: () => Environment | undefined
  active: (id: number | string) => void
  deactive: () => void
  variableIsDefined: (name: string) => boolean
  replaceVariables: (value: string) => string
  getVariableValue: (name: string) => string
}

type MenuHook = {
  items: { id?: string | number; title?: string; spacer?: boolean }[]
  selected: { id?: string | number; title?: string }
  select: (id: string | number) => void
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
