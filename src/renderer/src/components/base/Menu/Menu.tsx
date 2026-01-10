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
  menuIsOpen,
  onOpen,
  onClose,
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
  const [internalShowMenu, setInternalShowMenu] = useState(false)

  const isControlled = menuIsOpen !== undefined
  const showMenu = isControlled ? menuIsOpen : internalShowMenu

  useEffect(() => {
    if (showMenu && isMoving) {
      const timer = setTimeout(() => {
        if (!isControlled) {
          setInternalShowMenu(false)
        }
        onClose?.()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [showMenu, isMoving, isControlled, onClose])

  const handleOnClick = (e: React.MouseEvent<Element>) => {
    e.stopPropagation()
    const nextState = !showMenu

    if (!isControlled) {
      setInternalShowMenu(nextState)
    }

    if (nextState) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }

  const handleOnClickModal = (e: React.MouseEvent<Element>) => {
    e.stopPropagation()
    if (!preventCloseOnClick) {
      if (!isControlled) {
        setInternalShowMenu(false)
      }
      onClose?.()
    }
  }

  const handleCloseModal = () => {
    if (!isControlled) {
      setInternalShowMenu(false)
    }
    onClose?.()
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
          closeModal={handleCloseModal}
          onClick={handleOnClickModal}
        >
          {children}
        </LinkedModal>
      )}
    </div>
  )
}
