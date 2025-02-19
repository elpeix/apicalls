import React, { useEffect, useRef, useState } from 'react'
import styles from './EditableName.module.css'
import Name from '../Name'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export default function EditableName({
  name,
  editMode = false,
  placeholder = 'Name',
  className = '',
  update,
  editingClassName = '',
  onBlur,
  editOnDoubleClick
}: {
  name: string
  editMode: boolean
  placeholder?: string
  className?: string
  editingClassName?: string
  update: (name: string) => void
  onBlur?: () => void
  editOnDoubleClick?: boolean
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(name)
  const nameRef = useRef<HTMLInputElement>(null)
  const ipcRenderer = window.electron?.ipcRenderer

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
  }, [editMode, nameValue, name, editingName])

  useEffect(() => {
    setNameValue(name)
  }, [name])

  const cancelEdit = () => {
    if (!editingName) return
    setEditingName(false)
    setNameValue(name)
    if (onBlur) onBlur()
    ipcRenderer?.removeListener(ACTIONS.escape, cancelEdit)
  }

  useEffect(() => {
    if (editingName) {
      ipcRenderer?.removeListener(ACTIONS.escape, cancelEdit)
      ipcRenderer?.once(ACTIONS.escape, cancelEdit)
    }
    return () => ipcRenderer?.removeListener(ACTIONS.escape, cancelEdit)
  }, [ACTIONS.escape, cancelEdit, editingName])

  const editName = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!editOnDoubleClick) return
    setEditingName(true)
    setNameValue(name)
    ipcRenderer?.on(ACTIONS.escape, cancelEdit)
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
      className={`${styles.name} ${className} ${editingName ? `${styles.editable} ${editingClassName}` : ''}`}
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
