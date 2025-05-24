import React, { useEffect, useRef, useState } from 'react'
import ButtonIcon from '../ButtonIcon'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './Menu.module.css'
import { ReactMenuElement } from './MenuElement'

export default function Menu({
  className = '',
  showMenuClassName = '',
  menuModalClassName = '',
  icon = 'menu',
  iconDirection = 'west',
  iconClassName = '',
  isMoving = false,
  menuIsOpen = false,
  onOpen = () => {},
  onClose = () => {},
  preventCloseOnClick = false,
  topOffset = 23,
  leftOffset = -134,
  children
}: {
  className?: string
  showMenuClassName?: string
  menuModalClassName?: string
  icon?: string
  iconDirection?: 'west' | 'east' | 'north' | 'south'
  iconClassName?: string
  isMoving?: boolean
  menuIsOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  preventCloseOnClick?: boolean
  topOffset?: number
  leftOffset?: number
  children: ReactMenuElement | ReactMenuElement[] | React.ReactNode
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
  const menuIconClassName = `${styles.menuIcon} ${iconClassName} ${showMenu ? styles.active : ''}`
  const modalClassName = `${styles.menuModal} ${menuModalClassName}`

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
      {icon && (
        <ButtonIcon
          className={menuIconClassName}
          icon={icon}
          direction={iconDirection}
          onClick={handleOnClick}
        />
      )}
      {showMenu && (
        <LinkedModal
          parentRef={menuRef}
          zIndex={1}
          topOffset={topOffset}
          leftOffset={leftOffset}
          className={modalClassName}
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
