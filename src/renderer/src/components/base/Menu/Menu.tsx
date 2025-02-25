import React, { useEffect, useRef, useState } from 'react'
import ButtonIcon from '../ButtonIcon'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './Menu.module.css'
import { ReactMenuElement } from './MenuElement'

export default function Menu({
  className = '',
  showMenuClassName = '',
  iconClassName = '',
  isMoving = false,
  menuIsOpen = false,
  onOpen = () => {},
  onClose = () => {},
  preventCloseOnClick = false,
  children
}: {
  className?: string
  showMenuClassName?: string
  iconClassName?: string
  isMoving?: boolean
  menuIsOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  preventCloseOnClick?: boolean
  children: ReactMenuElement
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (showMenu && isMoving) {
      setShowMenu(false)
    }
  }, [showMenu, isMoving])

  useEffect(() => {
    setShowMenu(menuIsOpen)
  }, [menuIsOpen])

  useEffect(() => {
    if (showMenu) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }, [showMenu])

  const handleOnClick = (e: React.MouseEvent<Element>) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }
  const handleOnClickModal = (e: React.MouseEvent<Element>) => {
    e.stopPropagation()
    if (!preventCloseOnClick) {
      setShowMenu(false)
    }
  }

  const menuClassName = `${styles.menu} ${className} ${showMenu ? `${styles.active} ${showMenuClassName}` : ''}`

  return (
    <div
      ref={menuRef}
      className={menuClassName}
      draggable={true}
      onDragStart={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      <ButtonIcon
        className={`${iconClassName} ${styles.menuIcon}`}
        icon="menu"
        direction="west"
        onClick={handleOnClick}
      />
      {showMenu && (
        <LinkedModal
          parentRef={menuRef}
          zIndex={1}
          topOffset={23}
          leftOffset={-134}
          className={styles.menuModal}
          useOverlay={true}
          closeModal={() => setShowMenu(false)}
          onClick={handleOnClickModal}
        >
          {children}
        </LinkedModal>
      )}
    </div>
  )
}
