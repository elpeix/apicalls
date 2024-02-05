import React from 'react'
import RequestContextProvider from '../../context/RequestContext'
import RequestPanelContent from './RequestPanelContent'

export default function RequestPanel({ tab }: { tab: RequestTab }) {
  return (
    <RequestContextProvider path={tab.path} tabId={tab.id} definedRequest={tab.request}>
      <RequestPanelContent />
    </RequestContextProvider>
  )
}
