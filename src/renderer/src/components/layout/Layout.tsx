import React, { useContext, useEffect, useRef, useState } from 'react'
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels'
import { AppContext } from '../../context/AppContext'
import SideMenu from './sideBar/SideMenu/SideMenu'
import SidePanel from './sideBar/SidePanel/SidePanel'
import ContentTabs from './ContentTabs'
import Gutter from './Gutter'
import { ACTIONS } from '../../../../lib/ipcChannels'
import FindRequests from './FindRequests/FindRequests'

export default function Layout() {
  const { application, menu, appSettings } = useContext(AppContext)
  const sidePanel = useRef<ImperativePanelHandle | null>(null)
  const [showSelected, setShowSelected] = useState(false)

  useEffect(() => {
    setShowSelected(menu != null && !!menu.expanded && !!menu.selected)
  }, [menu])

  useEffect(() => {
    if (menu?.expanded) {
      sidePanel.current?.expand()
    } else {
      sidePanel.current?.collapse()
    }
  }, [menu?.expanded])

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.findRequest, () => {
      application.showDialog?.({
        children: <FindRequests />,
        position: 'top'
      })
    })
    return () => ipcRenderer?.removeAllListeners(ACTIONS.findRequest)
  }, [])

  const expandSidePanel = () => sidePanel.current && sidePanel.current?.expand()

  const handleExpand = () => menu?.setExpanded(true)
  const handleCollapse = () => menu?.setExpanded(false)
  const toggleSidePanel = () => menu?.setExpanded(!menu.expanded)

  return (
    <div
      className={`app ${appSettings?.isCustomWindowMode() ? ' custom-window' : 'native-window'}`}
    >
      <PanelGroup direction="horizontal" autoSaveId="panelLayout">
        <SideMenu
          showSelected={showSelected}
          onSelect={expandSidePanel}
          isCollapsed={!menu?.expanded}
          toggleCollapse={toggleSidePanel}
        />
        <Panel
          defaultSize={15}
          minSize={10}
          maxSize={40}
          collapsible={true}
          ref={sidePanel}
          className="container-query"
          onExpand={handleExpand}
          onCollapse={handleCollapse}
        >
          <SidePanel />
        </Panel>
        <Gutter mode="vertical" onDoubleClick={expandSidePanel} />
        <Panel>
          <ContentTabs />
        </Panel>
      </PanelGroup>
    </div>
  )
}
