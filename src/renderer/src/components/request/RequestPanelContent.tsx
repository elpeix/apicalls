import React, { useContext, useEffect, useRef, useState } from 'react'
import { RequestContext } from '../../context/RequestContext'
import RequestBar from './RequestBar'
import RequestTabs from './RequestTabs'
import Console from '../base/Console/Console'
import Response from '../response/Response'
import styles from './Request.module.css'
import { ACTIONS } from '../../../../lib/ipcChannels'
import { AppContext } from '../../context/AppContext'
import ResponseStatus from '../response/ResponseStatus'
import { Group, Panel, PanelHandle, Separator } from '../base/SimplePanel'

export default function RequestPanelContent() {
  const { appSettings, application } = useContext(AppContext)
  const { isActive, request, fetching, save, setOpenSaveAs } = useContext(RequestContext)
  const [panelView, setPanelView] = useState<AppSettingsRequestView>(
    appSettings?.settings?.requestView
      ? appSettings?.settings?.requestView === 'horizontal'
        ? 'vertical'
        : 'horizontal'
      : 'vertical'
  )

  useEffect(() => {
    if (!appSettings) return
    setPanelView(appSettings?.settings?.requestView || 'horizontal')
  }, [appSettings])

  const requestPanel = useRef<PanelHandle>(null)
  const [requestPanelCollapsed, setRequestPanelCollapsed] = useState(false)
  const consolePanel = useRef<PanelHandle>(null)
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)

  useEffect(() => {
    if (!isActive || fetching) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.sendRequest, () => {
      if (application.dialogIsOpen) return
      return request?.fetch()
    })
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.sendRequest)
    }
  }, [isActive, request, fetching])

  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.saveRequest, () => save())
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.saveRequest)
    }
  }, [isActive, save])

  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.saveAsRequest, () => {
      if (setOpenSaveAs) {
        setOpenSaveAs(true)
      }
    })
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.saveAsRequest)
    }
  }, [isActive, setOpenSaveAs])

  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.toggleRequestPanel, () => {
      if (!requestPanel.current) return
      if (requestPanelCollapsed) requestPanel.current.expand()
      else requestPanel.current.collapse()
    })
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.toggleRequestPanel)
    }
  }, [isActive, requestPanelCollapsed])

  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.toggleConsole, () => {
      if (consoleCollapsed) consolePanel?.current?.expand()
      else consolePanel?.current?.collapse()
    })
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.toggleConsole)
    }
  }, [isActive, consoleCollapsed])

  if (!request) return null

  const toggleRequestPanel = () => {
    if (!requestPanel.current) return
    if (requestPanelCollapsed) requestPanel.current.expand()
    else requestPanel.current.collapse()
  }
  const collapseConsole = () => consolePanel?.current?.collapse()
  const expandConsole = () => consolePanel?.current?.expand()
  const toggleConsole = () => {
    if (consoleCollapsed) expandConsole()
    else collapseConsole()
  }

  return (
    <div className={styles.panel}>
      <RequestBar />
      <Group orientation="horizontal" storageId="requestResponsePanelLayout">
        <Panel>
          <Group orientation={panelView} storageId="requestPanelLayout">
            <Panel
              defaultSize={30}
              minSize={panelView === 'vertical' ? 10 : 25}
              maxSize={90}
              collapsible={true}
              ref={requestPanel}
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
          minSize={10}
          maxSize={panelView === 'horizontal' ? 50 : 85.9}
          collapsible={true}
          ref={consolePanel}
          onCollapse={() => setConsoleCollapsed(true)}
          onExpand={() => setConsoleCollapsed(false)}
        >
          <Console collapse={collapseConsole} />
        </Panel>
      </Group>
    </div>
  )
}
