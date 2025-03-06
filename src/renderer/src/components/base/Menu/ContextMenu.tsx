import React from 'react'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './Menu.module.css'

export default function ContextMenu({
  topOffset = 0,
  leftOffset = 0,
  onClose,
  parentRef,
  children
}: {
  topOffset?: number
  leftOffset?: number
  onClose: () => void
  parentRef: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}) {
  return (
    <LinkedModal
      parentRef={parentRef}
      zIndex={1}
      topOffset={topOffset}
      leftOffset={leftOffset}
      className={styles.menuModal}
      useOverlay={true}
      closeModal={onClose}
    >
      {children}
    </LinkedModal>
  )
}
