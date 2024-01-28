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

  return (
    <div ref={menuRef} className={`${styles.menu} ${className} ${showMenu ? styles.active : ''}`}>
      <ButtonIcon
        className={`${iconClassName} ${styles.menuIcon}`}
        icon="menu"
        direction="west"
        onClick={() => setShowMenu(true)}
      />
      {showMenu && (
        <LinkedModal
          parentRef={menuRef}
          zIndex={1}
          topOffset={3}
          leftOffset={-136}
          className={styles.menuModal}
          closeModal={() => setShowMenu(false)}
          onClick={() => setShowMenu(false)}
        >
          {children}
        </LinkedModal>
      )}
    </div>
  )
}
