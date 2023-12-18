import React, { useContext, useRef, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import RequestBar from './RequestBar'
import { Panel, PanelGroup } from 'react-resizable-panels'
import RequestTabs from './RequestTabs'
import Gutter from '../layout/Gutter'
import Console from '../base/Console/Console'
import Response from '../response/Response'
import styles from './Request.module.css'

export default function RequestPanelContent() {
  const { request, fetching } = useContext(RequestContext)

  if (!request) return null

  const requestPanel = useRef<any>()
  const [requestPanelCollapsed, setRequestPanelCollapsed] = useState(false)
  const consolePanel = useRef<any>()
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)

  const toggleRequestPanel = () => {
    if (!requestPanel.current) return
    if (requestPanelCollapsed) requestPanel.current.expand()
    else requestPanel.current.collapse()
  }
  const collapseConsole = () => consolePanel.current.collapse()
  const expandConsole = () => consolePanel.current.expand()
  const toggleConsole = () => {
    if (consoleCollapsed) expandConsole()
    else collapseConsole()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
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
    <div className={styles.panel} onKeyDown={handleKeyDown}>
      <RequestBar />
      <PanelGroup direction="vertical">
        <Panel
          defaultSize={20}
          minSize={10}
          maxSize={50}
          collapsible={true}
          ref={requestPanel}
          onCollapse={() => setRequestPanelCollapsed(true)}
          onExpand={() => setRequestPanelCollapsed(false)}
        >
          <RequestTabs />
        </Panel>
        <Gutter mode="horizontal" onDoubleClick={toggleRequestPanel} />
        <Panel>
          <Response showConsole={expandConsole} consoleIsHidden={consoleCollapsed} />
        </Panel>
        <Gutter mode="horizontal" onDoubleClick={toggleConsole} />

        <Panel
          defaultSize={0}
          minSize={10}
          maxSize={35}
          collapsible={true}
          ref={consolePanel}
          onCollapse={() => setConsoleCollapsed(true)}
          onExpand={() => setConsoleCollapsed(false)}
        >
          <Console collapse={collapseConsole} />
        </Panel>
      </PanelGroup>
    </div>
  )
}
