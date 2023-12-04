import React, { useContext, useRef, useState } from 'react'
import { ImperativePanelHandle, Panel, PanelGroup } from 'react-resizable-panels'
import { AppContext } from '../../context/AppContext'
import SideMenu from './sideBar/SideMenu/SideMenu'
import SidePanel from './sideBar/SidePanel/SidePanel'
import ContentTabs from './ContentTabs'
import Gutter from './Gutter'

export default function Layout() {
  const { menu } = useContext(AppContext)
  const sidePanel = useRef<ImperativePanelHandle | null>(null)
  const [sidePanelCollapsed, setSidePanelCollapsed] = useState(false)
  const expandSidePanel = () => sidePanel.current && sidePanel.current?.expand()

  const showSelected: boolean = !sidePanelCollapsed && menu != null && !!menu.selected

  return (
    <PanelGroup direction="horizontal">
      <SideMenu
        showSelected={showSelected}
        onSelect={expandSidePanel}
        isCollapsed={sidePanelCollapsed}
        collapse={() => sidePanel.current && sidePanel.current?.collapse()}
      />
      <Panel
        defaultSizePercentage={15}
        minSizePercentage={10}
        maxSizePercentage={40}
        collapsible={true}
        ref={sidePanel}
        onCollapse={() => setSidePanelCollapsed(true)}
        onExpand={() => setSidePanelCollapsed(false)}
      >
        <SidePanel />
      </Panel>
      <Gutter mode="vertical" onDoubleClick={expandSidePanel} />
      <Panel>
        <ContentTabs />
      </Panel>
    </PanelGroup>
  )
}
