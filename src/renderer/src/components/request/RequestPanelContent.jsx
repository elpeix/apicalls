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
    <div className={styles.panel} onKeyDown={handleKeyDown}>
      <RequestBar />
      <PanelGroup direction="vertical">
        <Panel
          defaultSizePercentage={20}
          minSizePercentage={10}
          maxSizePercentage={50}
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
          defaultSizePercentage={0}
          minSizePercentage={10}
          maxSizePercentage={35}
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
