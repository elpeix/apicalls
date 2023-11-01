import React, { useContext, useRef, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import RequestBar from '../request/RequestBar'
import { Panel, PanelGroup } from 'react-resizable-panels'
import RequestTabs from '../request/RequestTabs'
import Gutter from './Gutter'
import Console from '../base/Console/Console'
import Response from '../response/Response'

export default function RequestPanelContent() {

  const { request, fetching } = useContext(RequestContext)

  const requestPanel = useRef()
  const [requestPanelCollapsed, setRequestPanelCollapsed] = useState(false)
  const consolePanel = useRef()
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)

  const toggleRequestPanel = () => {
    if (requestPanelCollapsed) requestPanel.current.expand()
    else requestPanel.current.collapse()
  }
  const collapseConsole = () => consolePanel.current.collapse()
  const expandConsole = () => consolePanel.current.expand()
  const toggleConsole = () => {
    if (consoleCollapsed) expandConsole()
    else collapseConsole()
  }

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'Enter' && !fetching) {
      request.fetch()
      return
    }
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      toggleConsole()
    }
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      event.preventDefault()
      event.stopPropagation()
      toggleRequestPanel()
    }
  }

  return (
    <div className='request-panel' onKeyDown={handleKeyDown}>
      <RequestBar />
      <PanelGroup direction="vertical">
        <Panel
          defaultSize={20}
          minSize={10}
          maxSize={50}
          collapsible={true}
          ref={requestPanel}
          onCollapse={setRequestPanelCollapsed}
        >
          <RequestTabs />
        </Panel>
        <Gutter mode='horizontal' onDoubleClick={toggleRequestPanel} />
        <Panel >
          <Response showConsole={expandConsole} consoleIsHidden={consoleCollapsed} />
        </Panel>
        <Gutter mode='horizontal' onDoubleClick={toggleConsole} />
        <Panel
          defaultSize={0}
          minSize={10}
          maxSize={35}
          collapsible={true}
          ref={consolePanel}
          onCollapse={setConsoleCollapsed}
        >
          <Console collapse={collapseConsole} />
        </Panel>
      </PanelGroup>
    </div>
  )
}
