import React, { useContext, useEffect, useState } from 'react'
import styles from './SideMenu.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'

export default function SideMenu({
  showSelected,
  onSelect,
  isCollapsed,
  collapse
}: {
  showSelected: boolean
  onSelect: () => void
  isCollapsed: boolean
  collapse: () => void
}) {
  const { menu } = useContext(AppContext)
  const [selected, setSelected] = useState<MenuItem>({ id: '', title: '' })
  useEffect(() => {
    if (!menu) return
    setSelected(menu.selected)
  }, [menu])

  const isSelected = (id: Identifier) => showSelected && selected && selected.id === id
  const handleClick = (id: Identifier) => {
    if (id && menu) {
      if (!isCollapsed && menu.selected && menu.selected.id === id) {
        collapse()
        return
      }
      menu.select(id)
      onSelect()
    }
  }

  const windowAPI = window.api as WindowAPI
  const macClass = windowAPI?.os.isMac ? styles.mac : ''

  return (
    <div className={`${styles.sideMenu} ${isCollapsed ? styles.collapsed : ''} ${macClass}`}>
      {menu &&
        menu.items.map((item, index) => (
          <div
            key={index}
            className={`${styles.item} ${isSelected(item.id) ? styles.active : ''}  ${
              item.spacer ? styles.spacer : ''
            }`}
            title={item.title ? item.title : ''}
            onClick={() => !item.spacer && handleClick(item.id)}
          >
            {item.id && !item.spacer && <ButtonIcon icon={item.id} size={24} title={item.title} />}
          </div>
        ))}
    </div>
  )
}
