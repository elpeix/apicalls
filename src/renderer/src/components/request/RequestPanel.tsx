import React from 'react'
import RequestContextProvider from '../../context/RequestContext'
import RequestPanelContent from './RequestPanelContent'

const RequestPanel = React.memo(function RequestPanel({ tab }: { tab: RequestTab }) {
  return (
    <RequestContextProvider tab={tab}>
      <RequestPanelContent />
    </RequestContextProvider>
  )
})

export default RequestPanel
