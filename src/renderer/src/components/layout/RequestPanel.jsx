import React, { useRef, useState } from 'react'
import RequestBar from '../request/RequestBar'
import { Panel, PanelGroup } from 'react-resizable-panels'
import Gutter from './Gutter'
import RequestTabs from '../request/RequestTabs'
import Response from '../response/Response'
import Console from '../base/Console/Console'
import RequestContextProvider from '../../context/RequestContext'

export default function RequestPanel({ definedRequest }) {

  const requestPanel = useRef()
  const consolePanel = useRef()
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)

  const expandRequestPanel = () => requestPanel.current.expand()
  const collapseConsole = () => consolePanel.current.collapse()
  const expandConsole = () => consolePanel.current.expand()

  return (
    <RequestContextProvider definedRequest={definedRequest}>
      <div className='request-panel'>
        <RequestBar />
        <PanelGroup direction="vertical">
          <Panel defaultSize={20} minSize={10} maxSize={50} collapsible={true} ref={requestPanel}>
            <RequestTabs />
          </Panel>
          <Gutter mode='horizontal' onDoubleClick={expandRequestPanel} />
          <Panel >
            <Response showConsole={expandConsole} consoleIsHidden={consoleCollapsed} />
          </Panel>
          <Gutter mode='horizontal' onDoubleClick={expandConsole} />
          <Panel defaultSize={0} minSize={10} maxSize={35} collapsible={true} ref={consolePanel} onCollapse={setConsoleCollapsed}>
            <Console collapse={collapseConsole} />
          </Panel>
        </PanelGroup>
      </div>
    </RequestContextProvider>
  )
}
