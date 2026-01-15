import React, { useRef, useState } from 'react'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './NoteModal.module.css'
import { useDebounce } from '../../../hooks/useDebounce'
import ButtonIcon from '../ButtonIcon'

export default function NoteModal({
  value = '',
  editable = false,
  className = '',
  iconSize = 20,
  onClickIcon = (_: React.MouseEvent) => {}
}: {
  value?: string
  editable?: boolean
  className?: string
  iconSize?: number
  onClickIcon?: (e: React.MouseEvent) => void
}) {
  const ref = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const debouncedShowModal = useDebounce(showModal, 500, 100)
  const handleMouseOver = () => setShowModal(true)
  const handleMouseLeave = () => {
    setShowModal(false)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  if (!editable && !value) {
    return
  }

  return (
    <div ref={ref} className={`${styles.note} ${className}`} onMouseLeave={handleMouseLeave}>
      <ButtonIcon
        icon="file"
        size={iconSize}
        className={styles.infoIcon}
        iconClassName={styles.icon}
        onClick={onClickIcon}
        onMouseOver={handleMouseOver}
      />
      {debouncedShowModal && (
        <LinkedModal
          parentRef={ref}
          className={`${styles.noteModal} fadeIn`}
          topOffset={24}
          leftOffset={10}
          closeModal={handleClose}
        >
          <div className={styles.noteContent}>{value}</div>
        </LinkedModal>
      )}
    </div>
  )
}
