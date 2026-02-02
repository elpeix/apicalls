import { createContext, useContext } from 'react'
import { createAuth, getMethods } from '../lib/factory'

const methods = getMethods()

export const RequestDataContext = createContext<RequestDataContextType>({
  method: methods[0],
  url: '',
  body: '',
  auth: createAuth('none'),
  headers: [],
  queryParams: [],
  pathParams: [],
  preScript: '',
  postScript: ''
})

export function useRequestData(): RequestDataContextType {
  return useContext(RequestDataContext)
}
