import React, { useContext, useRef, useState } from 'react'
import styles from './TabTitle.module.css'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { AppContext } from '../../../context/AppContext'
import ButtonIcon from '../../base/ButtonIcon'

export default function TabTitle({ tab }) {

  const { tabs } = useContext(AppContext)
  const [editing, setEditing] = useState(false)
  const inputRef = useRef()

  const getTabTitle = () => {
    if (tab.type === 'history') return 'History'
    if (tab.type === 'draft') return 'Draft'
    return tab.name || tab.id
  }

  const onDoubleClick = () => {
    if (tab.type === 'history') return
    setEditing(true)
    setTimeout(() => inputRef.current.focus(), 0)
  }

  useOutsideClick(inputRef, () => setEditing(false))

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setEditing(false)
    }

    // TODO: save tab name
    if (e.key === 'Enter') {
      setEditing(false)
    }
  }

  const onClose = (e) => {
    e.stopPropagation()
    tabs.removeTab(tab.id)
  }

  const active = tab.active ? styles.active : ''
  

  return (
    <div className={`${styles.tabTitle} ${styles[tab.type]} ${active}`}>
      {editing && (
        <input
          type="text"
          ref={inputRef}
          className={styles.input}
          value={tab.name}
          onKeyDown={onKeyDown}
          placeholder='Request name'
        />
      )}
      {! editing && (
        <div className={styles.content}>
          <span className={styles.title} onDoubleClick={onDoubleClick}>
            {getTabTitle()}
          </span>
          <span className={styles.close} onClick={onClose}>
            <ButtonIcon icon='close' size={15} />
          </span>
        </div>
      ) }
    </div>
  )
}
