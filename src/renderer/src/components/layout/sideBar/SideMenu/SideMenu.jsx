import React, { useContext, useEffect, useState } from 'react'
import styles from './SideMenu.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'

export default function SideMenu({ showSelected, onSelect, isCollapsed, collapse }) {

  const appContext = useContext(AppContext)
  const [selected, setSelected] = useState('')
  useEffect(() => {
    setSelected(appContext.menu.selected)
  }, [appContext])

  const isSelected = id => showSelected && selected && selected.id === id
  const handleClick = id => {
    if (id) {
      if (!isCollapsed && appContext.menu.selected && appContext.menu.selected.id === id) {
        collapse()
        return
      }
      appContext.menu.select(id)
      onSelect()
    }
  }
  
  return (
    <div className={`${styles.sideMenu} ${isCollapsed ? styles.collapsed : ''}`}>
      {appContext.menu.items.map((item, index) => (
        <div 
          key={index}
          className={`${styles.item} ${isSelected(item.id) ? styles.active : ''}  ${item.spacer ? styles.spacer : ''}`}
          title={item.title ? item.title : ''}
          onClick={() => handleClick(item.id)}
        >
          {item.id && <ButtonIcon icon={item.id} size={24} />}
        </div>
      ))}

    </div>
  )
}
