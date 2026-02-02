import React, { createContext, useContext, useMemo } from 'react'
import { AppContext } from './AppContext'
import { useConsole } from '../hooks/useConsole'
import { useRequestState, responseInitialValue } from '../hooks/requestContext/useRequestState'
import { useScriptExecutor } from '../hooks/requestContext/useScriptExecutor'
import { useRequestSender } from '../hooks/requestContext/useRequestSender'
import { RequestDataContext } from './RequestDataContext'
import { RequestActionsContext } from './RequestActionsContext'
import { RequestMetaContext } from './RequestMetaContext'

// Legacy context - maintained for backward compatibility during migration
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

// Re-export contexts and hooks for the new specialized contexts
export { RequestDataContext, useRequestData } from './RequestDataContext'
export { RequestActionsContext, useRequestActions } from './RequestActionsContext'
export { RequestMetaContext, useRequestMeta } from './RequestMetaContext'

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

  // RequestDataContext value - data that changes frequently
  const dataValue = useMemo<RequestDataContextType>(
    () => ({
      method: requestState.requestMethod,
      url: requestState.requestUrl,
      body: requestState.requestBody,
      auth: requestState.requestAuth,
      headers: requestState.requestHeaders,
      queryParams: requestState.requestQueryParams,
      pathParams: requestState.requestPathParams,
      preScript: requestState.requestPreScript,
      postScript: requestState.requestPostScript
    }),
    [
      requestState.requestMethod,
      requestState.requestUrl,
      requestState.requestBody,
      requestState.requestAuth,
      requestState.requestHeaders,
      requestState.requestQueryParams,
      requestState.requestPathParams,
      requestState.requestPreScript,
      requestState.requestPostScript
    ]
  )

  // RequestActionsContext value - stable actions (callbacks)
  const actionsValue = useMemo<RequestActionsContextType>(
    () => ({
      setMethod: requestState.setMethod,
      setUrl: requestState.setUrl,
      setFullUrl: requestState.setFullUrl,
      getFullUrl: requestState.getFullUrl,
      setBody: requestState.setBody,
      setAuth: requestState.setAuth,
      setPreScript: requestState.setPreScript,
      setPostScript: requestState.setPostScript,
      headers: {
        set: requestState.setHeaders,
        add: requestState.addHeader,
        remove: requestState.removeHeader,
        getActiveLength: requestState.getActiveHeadersLength
      },
      pathParams: {
        set: requestState.setPathParams,
        remove: requestState.removePathParam,
        getActiveLength: requestState.getActivePathParamsLength
      },
      queryParams: {
        set: requestState.setQueryParams,
        add: requestState.addQueryParam,
        remove: requestState.removeQueryParam,
        getActiveLength: requestState.getActiveQueryParamsLength
      },
      fetch: requestSender.fetch,
      cancel: requestSender.cancel,
      urlIsValid: requestState.urlIsValid
    }),
    [
      requestState.setMethod,
      requestState.setUrl,
      requestState.setFullUrl,
      requestState.getFullUrl,
      requestState.setBody,
      requestState.setAuth,
      requestState.setPreScript,
      requestState.setPostScript,
      requestState.setHeaders,
      requestState.addHeader,
      requestState.removeHeader,
      requestState.getActiveHeadersLength,
      requestState.setPathParams,
      requestState.removePathParam,
      requestState.getActivePathParamsLength,
      requestState.setQueryParams,
      requestState.addQueryParam,
      requestState.removeQueryParam,
      requestState.getActiveQueryParamsLength,
      requestSender.fetch,
      requestSender.cancel,
      requestState.urlIsValid
    ]
  )

  // RequestMetaContext value - metadata that changes infrequently
  const metaValue = useMemo<RequestMetaContextType>(
    () => ({
      path: requestState.path || [],
      isActive: tab.active,
      collectionId: requestState.collectionId,
      tabId: requestState.tabId,
      saved: requestState.saved,
      openSaveAs: requestState.openSaveAs,
      save: requestState.saveRequest,
      setOpenSaveAs: requestState.setOpenSaveAs,
      setEditorState: requestState.setEditorState,
      getEditorState: requestState.getEditorState,
      getRequestEnvironment: requestState.getRequestEnvironment,
      copyAsCurl: requestState.copyAsCurl,
      pasteCurl: requestState.pasteCurl,
      requestConsole
    }),
    [
      requestState.path,
      tab.active,
      requestState.collectionId,
      requestState.tabId,
      requestState.saved,
      requestState.openSaveAs,
      requestState.saveRequest,
      requestState.setOpenSaveAs,
      requestState.setEditorState,
      requestState.getEditorState,
      requestState.getRequestEnvironment,
      requestState.copyAsCurl,
      requestState.pasteCurl,
      requestConsole
    ]
  )

  // Legacy RequestContext value - combines all for backward compatibility
  const requestContextValue = useMemo(
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

  const responseContextValue = useMemo(
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
    <RequestMetaContext.Provider value={metaValue}>
      <RequestActionsContext.Provider value={actionsValue}>
        <RequestDataContext.Provider value={dataValue}>
          <RequestContext.Provider value={requestContextValue}>
            <ResponseContext.Provider value={responseContextValue}>
              {children}
            </ResponseContext.Provider>
          </RequestContext.Provider>
        </RequestDataContext.Provider>
      </RequestActionsContext.Provider>
    </RequestMetaContext.Provider>
  )
}
