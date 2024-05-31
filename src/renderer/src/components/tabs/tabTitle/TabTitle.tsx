import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import ButtonIcon from '../../base/ButtonIcon'
import styles from './TabTitle.module.css'

export default function TabTitle({ tab }: { tab: RequestTab }) {
  const { tabs } = useContext(AppContext)
  const [tabName, setTabName] = useState<string>()
  const [saved, setSaved] = useState(tab.saved)

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

  const className = `${styles.tabTitle} ${styles[tab.type]} ${active} ${saved ? styles.saved : styles.unsaved}`

  return (
    <div className={className} onMouseDown={onMouseDown}>
      <div className={styles.content}>
        <span className={styles.title}>{getTabTitle()}</span>
        <span className={styles.close}>
          <ButtonIcon icon="close" size={15} onClick={onClose} />
        </span>
      </div>
    </div>
  )
}
