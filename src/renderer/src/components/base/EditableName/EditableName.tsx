import React, { useEffect, useRef, useState } from 'react'
import styles from './EditableName.module.css'
import Name from '../Name'

export default function EditableName({
  name,
  editMode = false,
  placeholder = 'Name',
  className = '',
  update,
  onBlur,
  editOnDoubleClick
}: {
  name: string
  editMode: boolean
  placeholder?: string
  className?: string
  update: (name: string) => void
  onBlur?: () => void
  editOnDoubleClick?: boolean
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName) return
    if (editMode) {
      setEditingName(true)
      setTimeout(() => {
        if (!nameRef.current || name.length === 0) return
        nameRef.current.setSelectionRange(0, nameValue.length)
        nameRef.current.focus()
      }, 0)
    }
  }, [editMode, nameValue.length, name, editingName])

  useEffect(() => {
    setNameValue(name)
  }, [name])

  const editName = () => {
    if (!editOnDoubleClick) return
    setEditingName(true)
    setNameValue(name)
    setTimeout(() => {
      if (!nameRef.current) return
      nameRef.current.setSelectionRange(0, nameValue.length)
      nameRef.current.focus()
    }, 0)
  }
  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value)
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingName(false)
      setNameValue(name)
      if (onBlur) onBlur()
    }
    if (e.key === 'Enter') {
      setEditingName(false)
      update(nameValue)
    }
  }

  const handleOnBlur = () => {
    setEditingName(false)
    update(nameValue)
    if (onBlur) onBlur()
  }

  const disableEvent = (e: React.DragEvent | React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      className={`${styles.name} ${className} ${editingName && styles.editable}`}
      onDoubleClick={editName}
    >
      {editingName && (
        <input
          ref={nameRef}
          className={styles.nameInput}
          placeholder={placeholder}
          value={nameValue}
          onChange={changeName}
          onBlur={handleOnBlur}
          onKeyDown={onKeyDown}
          draggable={true}
          onDragStart={disableEvent}
          onDrag={disableEvent}
          onDragEnd={disableEvent}
          onClick={disableEvent}
          onDoubleClick={disableEvent}
          autoFocus
        />
      )}
      {!editingName && <Name name={name} />}
    </div>
  )
}
