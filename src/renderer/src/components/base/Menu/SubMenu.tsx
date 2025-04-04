import React, { CSSProperties, useRef, useState } from 'react'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './Menu.module.css'
import { ReactMenuElement } from './MenuElement'
import Icon from '../Icon/Icon'
import { useDebounce } from '../../../hooks/useDebounce'

export default function SubMenu({
  icon = '',
  showIcon = true,
  title,
  color = '',
  className = '',
  showMenuClassName = '',
  onClick = () => {},
  closeOnClick = false,
  delayed = true,
  children
}: {
  icon?: string
  showIcon?: boolean
  title: string
  color?: string
  className?: string
  showMenuClassName?: string
  iconClassName?: string
  onClick?: () => void
  closeOnClick?: boolean
  delayed?: boolean
  children: ReactMenuElement
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  const delayedShowMenu = delayed ? 300 : 0
  const delayedHideMenu = delayed ? 500 : 0

  const debouncedShowMenu = useDebounce(showMenu, delayedShowMenu, delayedHideMenu)

  const handleOnClickModal = (e: React.MouseEvent<Element>) => {
    if (!closeOnClick) {
      e.stopPropagation()
    }
    onClick?.()
  }

  const menuClassName = `${styles.item} ${className} ${showMenu ? `${styles.active} ${showMenuClassName}` : ''}`
  const style: CSSProperties = color ? { color: color } : {}

  return (
    <div
      ref={menuRef}
      className={menuClassName}
      onMouseOver={() => setShowMenu(true)}
      onMouseOut={() => setShowMenu(false)}
      style={style}
    >
      {showIcon && <Icon icon={icon} className={className} />}
      <div className={styles.title}>{title}</div>
      <div className={styles.arrow}>
        <Icon icon="arrow" direction="east" />
      </div>
      {debouncedShowMenu && (
        <LinkedModal
          parentRef={menuRef}
          zIndex={1}
          topOffset={0}
          leftOffset={158}
          className={`${styles.menuModal} ${styles.subMenu}`}
          useOverlay={false}
          closeModal={() => setShowMenu(false)}
          onClick={handleOnClickModal}
        >
          {children}
        </LinkedModal>
      )}
    </div>
  )
}
