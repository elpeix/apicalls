import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import RequestBar from './RequestBar'
import RequestTabs from './RequestTabs'
import Console from '../base/Console/Console'
import Response from '../response/Response'
import styles from './Request.module.css'
import { AppContext } from '../../context/AppContext'
import ResponseStatus from '../response/ResponseStatus'
import { Group, Panel, Separator } from '../base/SimplePanel'
import { useRequestShortcuts } from './hooks/useRequestShortcuts'

export default function RequestPanelContent() {
  const { appSettings } = useContext(AppContext)
  const { request } = useContext(RequestContext)

  const panelView = appSettings?.settings?.requestView || 'horizontal'

  const {
    requestPanelRef,
    requestPanelCollapsed,
    setRequestPanelCollapsed,
    consolePanelRef,
    consoleCollapsed,
    setConsoleCollapsed
  } = useRequestShortcuts()

  if (!request) return null

  const toggleRequestPanel = () => {
    if (!requestPanelRef.current) {
      return
    }
    if (requestPanelCollapsed) {
      requestPanelRef.current.expand()
    } else {
      requestPanelRef.current.collapse()
    }
  }

  const collapseConsole = () => consolePanelRef.current?.collapse()
  const expandConsole = () => consolePanelRef.current?.expand()
  const toggleConsole = () => {
    if (consoleCollapsed) {
      expandConsole()
    } else {
      collapseConsole()
    }
  }

  return (
    <div className={styles.panel}>
      <RequestBar />
      <Group orientation="horizontal">
        <Panel>
          <Group orientation={panelView} storageId="requestPanelLayout">
            <Panel
              defaultSize={30}
              minSize={panelView === 'vertical' ? 10 : 25}
              maxSize={90}
              collapsible={true}
              ref={requestPanelRef}
              onCollapse={() => setRequestPanelCollapsed(true)}
              onExpand={() => setRequestPanelCollapsed(false)}
            >
              <RequestTabs />
            </Panel>
            <Separator onDoubleClick={toggleRequestPanel} />
            <Panel>
              <Response />
            </Panel>
          </Group>
        </Panel>
        <Separator onDoubleClick={toggleConsole} />
        <div className={styles.footer}>
          <ResponseStatus consoleIsHidden={consoleCollapsed} toggleConsole={toggleConsole} />
        </div>
        <Panel
          defaultCollapsed={true}
          defaultSize={30}
          minSize={10}
          maxSize={panelView === 'horizontal' ? 50 : 85.9}
          collapsible={true}
          ref={consolePanelRef}
          onCollapse={() => setConsoleCollapsed(true)}
          onExpand={() => setConsoleCollapsed(false)}
        >
          {consoleCollapsed ? null : <Console collapse={collapseConsole} />}
        </Panel>
      </Group>
    </div>
  )
}
