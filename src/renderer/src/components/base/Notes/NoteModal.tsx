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
  overlay = false
}: {
  value?: string
  editable?: boolean
  className?: string
  iconSize?: number
  overlay?: boolean
}) {
  const ref = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [showModalWithOverlay, setShowModalWithOverlay] = useState(false)
  const debouncedShowModal = useDebounce(showModal, 500, 100)
  const handleMouseOver = () => setShowModal(true)
  const handleMouseLeave = () => {
    if (overlay) {
      return
    }
    setShowModal(false)
  }

  const handleClickIcon = () => {
    if (!overlay) {
      return
    }
    setShowModalWithOverlay(true)
  }

  const handleClose = () => {
    if (!overlay) {
      return
    }
    setShowModalWithOverlay(false)
    setShowModal(false)
  }

  if (!editable && !value) {
    return
  }

  const modalIsVisible = showModalWithOverlay || debouncedShowModal

  return (
    <div ref={ref} className={`${styles.note} ${className}`} onMouseLeave={handleMouseLeave}>
      <ButtonIcon
        icon="file"
        size={iconSize}
        className={styles.infoIcon}
        iconClassName={styles.icon}
        onClick={handleClickIcon}
        onMouseOver={handleMouseOver}
      />
      {modalIsVisible && (
        <LinkedModal
          parentRef={ref}
          className={`${styles.noteModal} fadeIn`}
          useOverlay={overlay ?? false}
          allowOutsideClick={overlay ?? false}
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
