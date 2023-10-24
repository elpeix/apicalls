import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './TabTitle.module.css'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { AppContext } from '../../../context/AppContext'
import ButtonIcon from '../../base/ButtonIcon'

export default function TabTitle({ tab }) {

  const { tabs } = useContext(AppContext)
  const [editing, setEditing] = useState(false)
  const [tabName, setTabName] = useState()
  const inputRef = useRef()

  useEffect(() => setTabName(tab.name), [tab])

  const getTabTitle = () => {
    if (tabName !== undefined) return tabName
    if (tab.type === 'history') return 'History'
    if (tab.type === 'draft') return 'Draft'
    return tabName || tab.id
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
      console.log('save tab name', tabName)
      setEditing(false)
    }
  }

  const onChange = (e) => {
    setTabName(e.target.value)
  }

  const onClose = (e) => {
    e.stopPropagation()
    tabs.removeTab(tab.id)
  }

  const active = tab.active ? styles.active : ''
  
  const onMouseDown = (e) => {
    if (e.button === 1) {
      e.stopPropagation()
      tabs.removeTab(tab.id)
    }
  }

  return (
    <div className={`${styles.tabTitle} ${styles[tab.type]} ${active}`} onMouseDown={onMouseDown}>
      {editing && (
        <input
          type="text"
          ref={inputRef}
          className={styles.input}
          value={tabName}
          onKeyDown={onKeyDown}
          onChange={onChange}
          placeholder='Request name'
        />
      )}
      {! editing && (
        <div className={styles.content}>
          <span className={styles.title} onDoubleClick={onDoubleClick}>
            {getTabTitle()}
          </span>
          <span className={styles.close}>
            <ButtonIcon icon='close' size={15} onClick={onClose} />
          </span>
        </div>
      ) }
    </div>
  )
}
