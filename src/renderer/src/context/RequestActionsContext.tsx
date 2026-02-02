import { createContext, useContext } from 'react'

const noop = () => {}

export const RequestActionsContext = createContext<RequestActionsContextType>({
  setMethod: noop,
  setUrl: noop,
  setFullUrl: noop,
  getFullUrl: () => '',
  setBody: noop,
  setAuth: noop,
  setPreScript: noop,
  setPostScript: noop,
  headers: {
    set: noop,
    add: noop,
    remove: noop,
    getActiveLength: () => 0
  },
  pathParams: {
    set: noop,
    remove: noop,
    getActiveLength: () => 0
  },
  queryParams: {
    set: noop,
    add: noop,
    remove: noop,
    getActiveLength: () => 0
  },
  fetch: noop,
  cancel: noop,
  urlIsValid: () => false
})

export function useRequestActions(): RequestActionsContextType {
  return useContext(RequestActionsContext)
}
