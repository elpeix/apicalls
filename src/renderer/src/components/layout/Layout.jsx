import React, { useContext, useRef, useState } from 'react'
import { Panel, PanelGroup, } from 'react-resizable-panels'
import { AppContext } from '../../context/AppContext'
import SideMenu from './sideBar/SideMenu/SideMenu'
import SidePanel from './sideBar/SidePanel/SidePanel'
import ContentTabs from './ContentTabs'
import Gutter from './Gutter'

export default function Layout() {

  const appContext = useContext(AppContext)
  const sidePanel = useRef()
  const [sidePanelCollapsed, setSidePanelCollapsed] = useState(false)
  const expandSidePanel = () => sidePanel.current.expand()

  return (
    <PanelGroup direction="horizontal">
      <SideMenu
        showSelected={!sidePanelCollapsed && appContext.menu.selected}
        onSelect={expandSidePanel}
        isCollapsed={sidePanelCollapsed}
        collapse={() => sidePanel.current.collapse()}
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
