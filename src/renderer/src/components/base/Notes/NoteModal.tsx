import React, { useEffect, useRef, useState } from 'react'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './NoteModal.module.css'
import { useDebounce } from '../../../hooks/useDebounce'
import Icon from '../Icon/Icon'

export default function NoteModal({
  value = '',
  editable = false,
  className = '',
  iconSize = 20,
  onEdit = () => {}
}: {
  value?: string
  editable?: boolean
  className?: string
  iconSize?: number
  onEdit?: (value: string) => void
}) {
  const ref = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [note, setNote] = useState(value)
  const debouncedShowModal = useDebounce(showModal, 500, 100)

  useEffect(() => {
    setNote(value)
  }, [value])

  const handleMouseOver = () => setShowModal(true)
  const handleMouseOut = () => setShowModal(false)
  const handleOnClick = (e: React.MouseEvent) => {
    if (!editable) {
      return
    }
    e.stopPropagation()
    setEditMode(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onEdit(newValue)
  }

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
      <Icon icon="file" size={iconSize} className={styles.infoIcon} />
      {debouncedShowModal && (
        <LinkedModal
          parentRef={ref}
          className={`${styles.noteModal} fadeIn`}
          topOffset={24}
          leftOffset={10}
        >
          {editable && editMode && (
            <textarea onChange={handleChange} autoFocus>
              {note}
            </textarea>
          )}
          {!editMode && <div className={styles.noteContent}>{value}</div>}
        </LinkedModal>
      )}
    </div>
  )
}
