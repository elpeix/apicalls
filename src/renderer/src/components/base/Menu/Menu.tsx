import React, { useRef, useState } from 'react'
import ButtonIcon from '../ButtonIcon'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './Menu.module.css'
import { ReactMenuElement } from './MenuElement'

export default function Menu({
  className = '',
  iconClassName = '',
  children
}: {
  className?: string
  iconClassName?: string
  children: ReactMenuElement
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  const handleOnClick = (e: React.MouseEvent<Element>) => {
    e.stopPropagation()
    setShowMenu(true)
  }
  const handleOnClickModal = (e: React.MouseEvent<Element>) => {
    e.stopPropagation()
    setShowMenu(false)
  }

  return (
    <div ref={menuRef} className={`${styles.menu} ${className} ${showMenu ? styles.active : ''}`}>
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
          topOffset={3}
          leftOffset={-136}
          className={styles.menuModal}
          closeModal={() => setShowMenu(false)}
          onClick={handleOnClickModal}
        >
          {children}
        </LinkedModal>
      )}
    </div>
  )
}
