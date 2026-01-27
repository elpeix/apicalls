import React, { createContext, useContext } from 'react'
import { AppContext } from './AppContext'
import { useConsole } from '../hooks/useConsole'
import { useRequestState, responseInitialValue } from '../hooks/requestContext/useRequestState'
import { useScriptExecutor } from '../hooks/requestContext/useScriptExecutor'
import { useRequestSender } from '../hooks/requestContext/useRequestSender'

export const RequestContext = createContext<RequestContextType>({
  path: [],
  isActive: false,
  collectionId: null,
  request: null,
  fetching: false,
  fetched: false,
  fetchError: '',
  fetchErrorCause: '',
  response: responseInitialValue,
  save: () => {},
  setEditorState: () => {},
  getEditorState: () => '',
  requestConsole: null,
  getRequestEnvironment: () => null,
  copyAsCurl: () => {},
  pasteCurl: () => {}
})

export default function RequestContextProvider({
  tab,
  children
}: {
  tab: RequestTab
  children: React.ReactNode
}) {
  const { environments, application } = useContext(AppContext)

  const requestState = useRequestState(tab)

  const requestConsole = useConsole()

  const scriptExecutor = useScriptExecutor({
    environments,
    application,
    requestConsole
  })

  const requestSender = useRequestSender({
    tab,
    requestState,
    scriptExecutor,
    requestConsole
  })

  const contextValue = React.useMemo(
    () => ({
      path: requestState.path || [],
      isActive: tab.active,
      collectionId: requestState.collectionId,
      request: {
        method: requestState.requestMethod,
        url: requestState.requestUrl,
        body: requestState.requestBody,
        auth: requestState.requestAuth,
        preScript: requestState.requestPreScript,
        postScript: requestState.requestPostScript,
        headers: {
          items: requestState.requestHeaders,
          set: requestState.setHeaders,
          add: requestState.addHeader,
          remove: requestState.removeHeader,
          getActiveLength: requestState.getActiveHeadersLength
        },
        pathParams: {
          items: requestState.requestPathParams,
          set: requestState.setPathParams,
          remove: requestState.removePathParam,
          getActiveLength: requestState.getActivePathParamsLength
        },
        queryParams: {
          items: requestState.requestQueryParams,
          set: requestState.setQueryParams,
          add: requestState.addQueryParam,
          remove: requestState.removeQueryParam,
          getActiveLength: requestState.getActiveQueryParamsLength
        },
        setMethod: requestState.setMethod,
        setUrl: requestState.setUrl,
        setFullUrl: requestState.setFullUrl,
        getFullUrl: requestState.getFullUrl,
        setBody: requestState.setBody,
        setAuth: requestState.setAuth,
        setPreScript: requestState.setPreScript,
        setPostScript: requestState.setPostScript,
        fetch: requestSender.fetch,
        cancel: requestSender.cancel,
        urlIsValid: requestState.urlIsValid
      },
      fetching: requestSender.fetching,
      fetched: requestSender.fetched,
      fetchError: requestSender.fetchError,
      fetchErrorCause: requestSender.fetchErrorCause,
      response: requestState.response,
      save: requestState.saveRequest,
      saved: requestState.saved,
      requestConsole,
      tabId: requestState.tabId,
      openSaveAs: requestState.openSaveAs,
      setOpenSaveAs: requestState.setOpenSaveAs,
      setEditorState: requestState.setEditorState,
      getEditorState: requestState.getEditorState,
      getRequestEnvironment: requestState.getRequestEnvironment,
      copyAsCurl: requestState.copyAsCurl,
      pasteCurl: requestState.pasteCurl
    }),
    [
      requestState,
      tab.active,
      requestSender.fetch,
      requestSender.cancel,
      requestSender.fetching,
      requestSender.fetched,
      requestSender.fetchError,
      requestSender.fetchErrorCause,
      requestConsole
    ]
  )

  return <RequestContext.Provider value={contextValue}>{children}</RequestContext.Provider>
}
