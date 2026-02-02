import { createContext, useContext } from 'react'

const noop = () => {}

export const RequestMetaContext = createContext<RequestMetaContextType>({
  path: [],
  isActive: false,
  collectionId: null,
  tabId: undefined,
  saved: false,
  openSaveAs: false,
  save: noop,
  setOpenSaveAs: noop,
  setEditorState: noop,
  getEditorState: () => '',
  getRequestEnvironment: () => null,
  copyAsCurl: noop,
  pasteCurl: noop,
  requestConsole: null
})

export function useRequestMeta(): RequestMetaContextType {
  return useContext(RequestMetaContext)
}
