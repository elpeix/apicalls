import React, { useRef, useState } from 'react'
import ButtonIcon from '../ButtonIcon'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './Menu.module.css'
import { ReactMenuElement } from './MenuElement'

export default function Menu({
  className = '',
  children
}: {
  className?: string
  children: ReactMenuElement
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div ref={menuRef} className={`${styles.menu} ${className}`}>
      <ButtonIcon icon="menu" direction="west" onClick={() => setShowMenu(true)} />
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
