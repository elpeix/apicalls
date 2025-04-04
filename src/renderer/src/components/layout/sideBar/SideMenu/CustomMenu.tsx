import React, { useContext, useState } from 'react'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import Menu from '../../../base/Menu/Menu'
import SubMenu from '../../../base/Menu/SubMenu'
import { MENU_ACTIONS } from '../../../../../../lib/ipcChannels'
import styles from './SideMenu.module.css'
import { AppContext } from '../../../../context/AppContext'

export default function CustomMenu() {
  const { appSettings } = useContext(AppContext)
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const ipcRenderer = window.electron.ipcRenderer

  const handleMenuAction = (action: string) => {
    setMenuIsOpen(false)
    ipcRenderer.send(action)
  }

  return (
    <Menu
      icon="menu"
      iconDirection="south"
      topOffset={36}
      leftOffset={12}
      menuIsOpen={menuIsOpen}
      onOpen={() => setMenuIsOpen(true)}
      onClose={() => setMenuIsOpen(false)}
      className={styles.customMenu}
      menuModalClassName={styles.customMenuModal}
      preventCloseOnClick={true}
    >
      <SubMenu showIcon={false} title="File" delayed={false}>
        <MenuElement
          showIcon={false}
          title="New Tab"
          accelerator="CmdOrCtrl+T"
          onClick={() => handleMenuAction(MENU_ACTIONS.newTab)}
        />
        <MenuElement
          showIcon={false}
          title="Close Tab"
          accelerator="CmdOrCtrl+W"
          onClick={() => handleMenuAction(MENU_ACTIONS.closeTab)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="Save Request"
          accelerator="CmdOrCtrl+S"
          onClick={() => handleMenuAction(MENU_ACTIONS.saveRequest)}
        />
        <MenuElement
          showIcon={false}
          title="Save Request As"
          accelerator="CmdOrCtrl+Shift+T"
          onClick={() => handleMenuAction(MENU_ACTIONS.saveAsRequest)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="Exit"
          accelerator="CmdOrCtrl+Q"
          onClick={() => handleMenuAction(MENU_ACTIONS.close)}
        />
      </SubMenu>
      <SubMenu showIcon={false} title="Actions" delayed={false}>
        <MenuElement
          showIcon={false}
          title="Send Request"
          accelerator="CmdOrCtrl+Enter"
          onClick={() => handleMenuAction(MENU_ACTIONS.sendRequest)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="Find Request"
          accelerator="CmdOrCtrl+P"
          onClick={() => handleMenuAction(MENU_ACTIONS.findRequest)}
        />
        <MenuElement
          showIcon={false}
          title="Find Tab"
          accelerator="CmdOrCtrl+O"
          onClick={() => handleMenuAction(MENU_ACTIONS.findTab)}
        />
      </SubMenu>
      <SubMenu showIcon={false} title="View" delayed={false}>
        <MenuElement
          showIcon={false}
          title="Collections"
          accelerator="CmdOrCtrl+L"
          onClick={() => handleMenuAction(MENU_ACTIONS.showCollections)}
        />
        <MenuElement
          showIcon={false}
          title="Environments"
          accelerator="CmdOrCtrl+E"
          onClick={() => handleMenuAction(MENU_ACTIONS.showEnvironments)}
        />
        <MenuElement
          showIcon={false}
          title="History"
          accelerator="CmdOrCtrl+E"
          onClick={() => handleMenuAction(MENU_ACTIONS.showHistory)}
        />
        {appSettings?.settings?.manageCookies && (
          <MenuElement
            showIcon={false}
            title="Cookies"
            accelerator="CmdOrCtrl+E"
            onClick={() => handleMenuAction(MENU_ACTIONS.showCookies)}
          />
        )}
        <MenuElement
          showIcon={false}
          title="Settings"
          accelerator="CmdOrCtrl+E"
          onClick={() => handleMenuAction(MENU_ACTIONS.showSettings)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="Toggle Request view"
          accelerator="CmdOrCtrl+Shift+L"
          onClick={() => handleMenuAction(MENU_ACTIONS.toggleRequestView)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="Sidebar"
          accelerator="CmdOrCtrl+B"
          onClick={() => handleMenuAction(MENU_ACTIONS.toggleSidebar)}
        />
        <MenuElement
          showIcon={false}
          title="Request Panel"
          accelerator="CmdOrCtrl+Shift+P"
          onClick={() => handleMenuAction(MENU_ACTIONS.toggleRequestPanel)}
        />
        <MenuElement
          showIcon={false}
          title="Console"
          accelerator="CmdOrCtrl+Shift+C"
          onClick={() => handleMenuAction(MENU_ACTIONS.toggleConsole)}
        />
      </SubMenu>
      <SubMenu showIcon={false} title="Window" delayed={false}>
        <MenuElement
          showIcon={false}
          title="Submit a bug or idea"
          onClick={() => handleMenuAction(MENU_ACTIONS.submitBug)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="DevTools"
          accelerator="F12"
          onClick={() => handleMenuAction(MENU_ACTIONS.developerTools)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="Reload"
          accelerator="CmdOrCtrl+R"
          onClick={() => handleMenuAction(MENU_ACTIONS.reload)}
        />
        <MenuElement
          showIcon={false}
          title="Force reload"
          accelerator="CmdOrCtrl+Shift+R"
          onClick={() => handleMenuAction(MENU_ACTIONS.forceReload)}
        />
        <MenuSeparator />
        <MenuElement
          showIcon={false}
          title="Reset Zoom"
          accelerator="CmdOrCtrl+Shift+0"
          onClick={() => handleMenuAction(MENU_ACTIONS.resetZoom)}
        />
        <MenuElement
          showIcon={false}
          title="Zoom In"
          accelerator="CmdOrCtrl+Shift+Plus"
          onClick={() => handleMenuAction(MENU_ACTIONS.zoomIn)}
        />
        <MenuElement
          showIcon={false}
          title="Zoom Out"
          accelerator="CmdOrCtrl+Shift+-"
          onClick={() => handleMenuAction(MENU_ACTIONS.zoomOut)}
        />
      </SubMenu>
    </Menu>
  )
}
