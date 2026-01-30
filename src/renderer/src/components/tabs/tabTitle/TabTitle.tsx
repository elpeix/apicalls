import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import ButtonIcon from '../../base/ButtonIcon'
import styles from './TabTitle.module.css'
import Droppable from '../../base/Droppable/Droppable'
import { useDebounce } from '../../../hooks/useDebounce'
import TabTooltip from './TabTooltip'
import { MenuElement, MenuSeparator } from '../../base/Menu/MenuElement'
import ContextMenu from '../../base/Menu/ContextMenu'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export default function TabTitle({ tab }: { tab: RequestTab }) {
  const { tabs, application } = useContext(AppContext)
  const [onOver, setOnOver] = useState(false)
  const debouncedOnOver = useDebounce(onOver, 600)
  const ref = useRef<HTMLDivElement | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  const tabName = tab.name || ''
  const method = tab.request?.method?.value || 'GET'
  const saved = tab.saved ?? false

  useEffect(() => {
    if (tab.active) {
      const ipcRenderer = window.electron?.ipcRenderer
      ipcRenderer?.send(ACTIONS.setTitle, `${tab.request.method.label || 'GET'} - ${tab.name}`)
    }
  }, [tab.active, tab.request.method.label, tab.name])

  useEffect(() => {
    if (tab.active && ref && ref.current) {
      ref.current.scrollIntoView()
    }
  }, [tab.active])

  const getTabTitle = () => {
    if (tabName !== undefined) return tabName
    if (tab.type === 'history') return 'History'
    if (tab.type === 'draft') return 'Draft'
    return tabName || tab.id
  }

  const onClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    closeTab()
  }

  const closeTab = () => {
    application.tabActions.closeTab(tab)
    setShowMenu(false)
  }

  const closeOtherTabs = () => {
    application.tabActions.closeOtherTabs(tab)
    setShowMenu(false)
  }

  const closeAllTabs = () => {
    application.tabActions.closeAllTabs()
    setShowMenu(false)
  }

  const duplicateTab = () => {
    tabs?.duplicateTab(tab.id)
    setShowMenu(false)
  }

  const active = tab.active ? styles.active : ''

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !showMenu) {
      return
    }
    e.stopPropagation()
    e.preventDefault()
    if (e.button === 1) {
      application.tabActions.closeTab(tab)
      return
    }
    if (e.button === 2) {
      setShowMenu((prev) => !prev)
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.dataTransfer.setData('tabId', tab.id.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const tabId = e.dataTransfer.getData('tabId')
    tabs?.moveTab(tabId, tab.id)
  }

  const handleMouseOver = () => setOnOver(true)
  const handleMouseOut = () => setOnOver(false)

  const showInCollecction = () => {
    application.tabActions.revealRequest(tab)
    setShowMenu(false)
  }

  const className = `${styles.tabTitle} ${styles[tab.type]} ${active} ${saved ? styles.saved : styles.unsaved}`

  return (
    <Droppable
      className={className}
      onMouseDown={onMouseDown}
      draggable={true}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      allowedDropTypes={['tabId']}
    >
      <div
        className={styles.content}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        ref={ref}
      >
        <span className={`${styles.method} ${method}`}>{method}</span>
        <span className={styles.title}>{getTabTitle()}</span>
        <span className={styles.close}>
          <ButtonIcon icon="close" size={15} onClick={onClose} />
        </span>
      </div>
      {debouncedOnOver && <TabTooltip tabRef={ref} tab={tab} />}
      {showMenu && (
        <ContextMenu
          parentRef={ref}
          onClose={() => setShowMenu(false)}
          topOffset={30}
          leftOffset={3}
        >
          <MenuElement showIcon={false} title="Duplicate tab" onClick={duplicateTab} />
          <MenuSeparator />
          {tab.collectionId && (
            <>
              <MenuElement
                showIcon={false}
                title="Reveal in collection"
                onClick={showInCollecction}
              />
              <MenuSeparator />
            </>
          )}
          <MenuElement showIcon={false} title="Close tab" onClick={closeTab} />
          <MenuElement showIcon={false} title="Close other tabs" onClick={closeOtherTabs} />
          <MenuElement showIcon={false} title="Close all tabs" onClick={closeAllTabs} />
        </ContextMenu>
      )}
    </Droppable>
  )
}
