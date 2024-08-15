import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import ButtonIcon from '../../base/ButtonIcon'
import styles from './TabTitle.module.css'
import Droppable from '../../base/Droppable/Droppable'
import { useDebounce } from '../../../hooks/useDebounce'
import TabTooltip from './TabTooltip'

export default function TabTitle({ tab }: { tab: RequestTab }) {
  const { tabs } = useContext(AppContext)
  const [tabName, setTabName] = useState<string>()
  const [saved, setSaved] = useState(tab.saved)
  const [onOver, setOnOver] = useState(false)
  const debouncedOnOver = useDebounce(onOver, 800)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTabName(tab.name)
    setSaved(tab.saved || false)
  }, [tab])

  const getTabTitle = () => {
    if (tabName !== undefined) return tabName
    if (tab.type === 'history') return 'History'
    if (tab.type === 'draft') return 'Draft'
    return tabName || tab.id
  }

  const onClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    tabs?.removeTab(tab.id)
  }

  const active = tab.active ? styles.active : ''

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.stopPropagation()
      tabs?.removeTab(tab.id)
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
        <span className={styles.title}>{getTabTitle()}</span>
        <span className={styles.close}>
          <ButtonIcon icon="close" size={15} onClick={onClose} />
        </span>
      </div>
      {debouncedOnOver && <TabTooltip tabRef={ref} tab={tab} />}
    </Droppable>
  )
}
