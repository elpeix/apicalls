import React, { useRef, useState } from 'react'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './NoteMoal.module.css'

export default function NoteModal({
  value,
  editable = false,
  className = '',
  onEdit = () => {}
}: {
  value: string
  editable?: boolean
  className?: string
  onEdit?: (value: string) => void
}) {
  const ref = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const handleMouseOver = () => setShowModal(true)
  const handleMouseOut = () => setShowModal(false)

  const handleOnChange = () => {
    onEdit(value)
  }

  return (
    <div
      ref={ref}
      className={`${styles.note} ${className}`}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseOut}
    >
      <div className={styles.infoIcon}>i</div>
      {showModal && (
        <LinkedModal parentRef={ref} className={styles.noteModal} topOffset={20}>
          {editable && editMode && <textarea onChange={handleOnChange}>{value}</textarea>}
          {!editMode && <div onClick={() => setEditMode(true)}>{value}</div>}
        </LinkedModal>
      )}
    </div>
  )
}
