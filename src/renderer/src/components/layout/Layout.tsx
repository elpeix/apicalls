import React, { useContext, useEffect, useRef } from 'react'
import { AppContext } from '../../context/AppContext'
import SideMenu from './sideBar/SideMenu/SideMenu'
import SidePanel from './sideBar/SidePanel/SidePanel'
import ContentTabs from './ContentTabs'
import { ACTIONS } from '../../../../lib/ipcChannels'
import FindRequests from './FindRequests/FindRequests'
import { Group, Panel, PanelHandle, Separator } from '../base/SimplePanel'

export default function Layout() {
  const { application, menu, appSettings } = useContext(AppContext)
  const sidePanel = useRef<PanelHandle | null>(null)

  const showSelected = menu != null && !!menu.expanded && !!menu.selected

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
  }, [application])

  const expandSidePanel = () => sidePanel.current && sidePanel.current?.expand()

  const handleExpand = () => menu?.setExpanded(true)
  const handleCollapse = () => menu?.setExpanded(false)
  const toggleSidePanel = () => menu?.setExpanded(!menu.expanded)

  return (
    <div
      className={`app ${appSettings?.isCustomWindowMode() ? ' custom-window' : 'native-window'}`}
    >
      <Group orientation="vertical" storageId="panelLayout">
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
        <Separator onDoubleClick={expandSidePanel} />
        <Panel>
          <ContentTabs />
        </Panel>
      </Group>
    </div>
  )
}
