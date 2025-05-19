import React, { useContext, useEffect, useState } from 'react'
import styles from './SideMenu.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'
import CustomMenu from './CustomMenu'
import { WINDOW_ACTIONS } from '../../../../../../lib/ipcChannels'

export default function SideMenu({
  showSelected,
  onSelect,
  isCollapsed
}: {
  showSelected: boolean
  onSelect: () => void
  isCollapsed: boolean
}) {
  const { menu, appSettings } = useContext(AppContext)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selected, setSelected] = useState<MenuItem>({ id: '', title: '' })
  const [isFullScreen, setIsFullScreen] = useState(false)
  const ipcRenderer = window.electron?.ipcRenderer

  useEffect(() => {
    ipcRenderer?.on(WINDOW_ACTIONS.fullScreen, (_: unknown, fullScreen: boolean) => {
      setIsFullScreen(fullScreen)
    })
    return () => ipcRenderer?.removeAllListeners(WINDOW_ACTIONS.fullScreen)
  }, [])

  useEffect(() => {
    if (!menu) return
    const items = menu.items.filter((item) => {
      if (item.id === 'cookies') {
        return appSettings?.settings?.manageCookies || false
      }
      return true
    })
    setMenuItems(items)
    setSelected(menu.selected)
  }, [menu, appSettings?.settings?.manageCookies])

  const isSelected = (id: Identifier) => showSelected && selected && selected.id === id
  const handleClick = (id: Identifier) => {
    if (id && menu) {
      menu.select(id)
      onSelect()
    }
  }
  const isMac = window.api.os.isMac

  const showCustomMenu = !isMac && appSettings?.isCustomWindowMode()
  const showWorkspaceIcon = !isMac && !appSettings?.isCustomWindowMode()
  const showMacSpacer = isMac && !isFullScreen

  return (
    <div
      className={`${styles.sideMenu} ${isCollapsed ? styles.collapsed : ''} ${isMac && !isFullScreen ? styles.mac : ''}`}
    >
      {showCustomMenu && <CustomMenu />}
      {showWorkspaceIcon && (
        <div className={styles.workspace}>
          <ButtonIcon icon="workspace" size={20} onClick={onSelect} />
        </div>
      )}
      {showMacSpacer && <div className={styles.macSpacer}></div>}
      {menu &&
        menuItems.map((item, index) => (
          <div
            key={index}
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
                tooltipOffsetX={44}
              />
            )}
          </div>
        ))}
    </div>
  )
}
