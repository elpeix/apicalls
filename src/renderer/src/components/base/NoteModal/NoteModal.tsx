import React, { useRef, useState } from 'react'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './NoteMoal.module.css'
import { useDebounce } from '../../../hooks/useDebounce'

export default function NoteModal({
  value = '',
  editable = false,
  className = '',
  onEdit = () => {}
}: {
  value?: string
  editable?: boolean
  className?: string
  onEdit?: (value: string) => void
}) {
  const ref = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [note, setNote] = useState(value)
  const debouncedShowModal = useDebounce(showModal, 500, 200)

  const handleMouseOver = () => setShowModal(true)
  const handleMouseOut = () => setShowModal(false)
  const handleOnClick = (e: React.MouseEvent) => {
    if (!editable) {
      return
    }
    e.stopPropagation()
    setEditMode(true)
  }

  const HandleKeyDown = (e: React.KeyboardEvent) => {
    setNote('the note')
  }
  const handleOnChange = () => onEdit(note)

  if (!editable && !value) {
    return
  }

  return (
    <div
      ref={ref}
      className={`${styles.note} ${className}`}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseOut}
      onClick={handleOnClick}
    >
      <div className={styles.infoIcon}>i</div>
      {debouncedShowModal && (
        <LinkedModal
          parentRef={ref}
          className={`${styles.noteModal} fadeIn`}
          topOffset={20}
          leftOffset={-100}
        >
          {editable && editMode && (
            <textarea
              onChange={handleOnChange}
              onKeyDown={HandleKeyDown}
              autoFocus
              placeholder="Request note"
            >
              {note}
            </textarea>
          )}
          {!editMode && <div>{value}</div>}
        </LinkedModal>
      )}
    </div>
  )
}
