import React, { useContext, useEffect, useMemo, useState } from 'react'
import styles from './SideMenu.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'
import CustomMenu from './CustomMenu'
import { WINDOW_ACTIONS } from '../../../../../../lib/ipcChannels'

export default function SideMenu({
  showSelected,
  onSelect,
  isCollapsed,
  toggleCollapse
}: {
  showSelected: boolean
  onSelect: () => void
  isCollapsed: boolean
  toggleCollapse?: () => void
}) {
  const { menu, appSettings } = useContext(AppContext)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const ipcRenderer = window.electron?.ipcRenderer

  useEffect(() => {
    ipcRenderer?.on(WINDOW_ACTIONS.fullScreen, (_: unknown, fullScreen: boolean) => {
      setIsFullScreen(fullScreen)
    })
    return () => ipcRenderer?.removeAllListeners(WINDOW_ACTIONS.fullScreen)
  }, [ipcRenderer])

  const menuItems = useMemo(() => {
    if (!menu) return []
    return menu.items.filter((item) => {
      if (item.id === 'cookies') {
        return appSettings?.settings?.manageCookies || false
      }
      return true
    })
  }, [menu, appSettings?.settings?.manageCookies])

  const selected = menu?.selected

  const isSelected = (id: Identifier) => showSelected && selected && selected.id === id
  const handleClick = (id: Identifier) => {
    if (id && menu) {
      menu.select(id)
      onSelect()
    }
  }
  const isMac = window.api.os.isMac

  const showCustomMenu = !isMac && appSettings?.isCustomWindowMode()
  const showWorkspaceIcon =
    (!isMac && !appSettings?.isCustomWindowMode()) || (isMac && isFullScreen)
  const showMacSpacer = isMac && !isFullScreen
  const tooltipOffsetX = isMac && !isFullScreen ? 66 : 44

  return (
    <div
      className={`${styles.sideMenu} ${isCollapsed ? styles.collapsed : ''} ${isMac && !isFullScreen ? styles.mac : ''}`}
    >
      {showCustomMenu && <CustomMenu />}
      {showWorkspaceIcon && (
        <div className={styles.workspace}>
          <ButtonIcon icon="sidebar" size={20} onClick={toggleCollapse} />
        </div>
      )}
      {showMacSpacer && <div className={styles.macSpacer}></div>}
      {menu &&
        menuItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.item} ${isSelected(item.id) ? styles.active : ''}  ${
              item.spacer ? styles.spacer : ''
            }`}
            onClick={() => !item.spacer && handleClick(item.id)}
          >
            {item.id && !item.spacer && (
              <ButtonIcon
                icon={item.id}
                iconClassName={styles.icon}
                size={24}
                title={item.title}
                tooltipOffsetY={-44}
                tooltipOffsetX={tooltipOffsetX}
              />
            )}
          </div>
        ))}
    </div>
  )
}
