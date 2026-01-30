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
  save: () => {},
  setEditorState: () => {},
  getEditorState: () => '',
  requestConsole: null,
  getRequestEnvironment: () => null,
  copyAsCurl: () => {},
  pasteCurl: () => {}
})

export const ResponseContext = createContext<ResponseContextType>({
  fetching: false,
  fetched: false,
  fetchError: '',
  fetchErrorCause: '',
  response: responseInitialValue,
  requestUrl: ''
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

  const requestContextValue = React.useMemo(
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
      requestState.path,
      tab.active,
      requestState.collectionId,
      requestState.requestMethod,
      requestState.requestUrl,
      requestState.requestBody,
      requestState.requestAuth,
      requestState.requestPreScript,
      requestState.requestPostScript,
      requestState.requestHeaders,
      requestState.setHeaders,
      requestState.addHeader,
      requestState.removeHeader,
      requestState.getActiveHeadersLength,
      requestState.requestPathParams,
      requestState.setPathParams,
      requestState.removePathParam,
      requestState.getActivePathParamsLength,
      requestState.requestQueryParams,
      requestState.setQueryParams,
      requestState.addQueryParam,
      requestState.removeQueryParam,
      requestState.getActiveQueryParamsLength,
      requestState.setMethod,
      requestState.setUrl,
      requestState.setFullUrl,
      requestState.getFullUrl,
      requestState.setBody,
      requestState.setAuth,
      requestState.setPreScript,
      requestState.setPostScript,
      requestSender.fetch,
      requestSender.cancel,
      requestState.urlIsValid,
      requestState.saveRequest,
      requestState.saved,
      requestConsole,
      requestState.tabId,
      requestState.openSaveAs,
      requestState.setOpenSaveAs,
      requestState.setEditorState,
      requestState.getEditorState,
      requestState.getRequestEnvironment,
      requestState.copyAsCurl,
      requestState.pasteCurl
    ]
  )

  const responseContextValue = React.useMemo(
    () => ({
      fetching: requestSender.fetching,
      fetched: requestSender.fetched,
      fetchError: requestSender.fetchError,
      fetchErrorCause: requestSender.fetchErrorCause,
      response: requestState.response,
      requestUrl: requestSender.fetchedUrl
    }),
    [
      requestSender.fetching,
      requestSender.fetched,
      requestSender.fetchError,
      requestSender.fetchErrorCause,
      requestState.response,
      requestSender.fetchedUrl
    ]
  )

  return (
    <RequestContext.Provider value={requestContextValue}>
      <ResponseContext.Provider value={responseContextValue}>
        {children}
      </ResponseContext.Provider>
    </RequestContext.Provider>
  )
}
