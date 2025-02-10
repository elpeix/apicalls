import React, { useState } from 'react'
import styles from './Droppable.module.css'
import { useDebounce } from '../../../hooks/useDebounce'

export default function Droppable({
  children,
  onClick,
  onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation(),
  draggable = false,
  onDragStart = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDragOverDebounced,
  className,
  dragDecorator = 'top',
  allowedDropTypes = [],
  ref
}: {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOverDebounced?: () => void
  children?: React.ReactNode
  className?: string
  dragDecorator?: 'top' | 'left'
  allowedDropTypes?: string[]
  ref?: React.RefObject<HTMLDivElement | null>
}) {
  const [dragOnOver, setDragOnOver] = useState(false)
  const debouncedDragOnOver = useDebounce(dragOnOver, 500)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isAllowedDrop(e)) return
    setDragOnOver(true)
    onDragEnter?.(e)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isAllowedDrop(e)) return
    setDragOnOver(true)
    if (debouncedDragOnOver && onDragOverDebounced) {
      onDragOverDebounced()
    }
    onDragOver?.(e)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(false)
    onDragLeave?.(e)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(false)
    if (!isAllowedDrop(e)) return
    onDrop(e)
  }

  const isAllowedDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (allowedDropTypes.length > 0) {
      const hasAllowedType = allowedDropTypes.some(
        (type) => e.dataTransfer.types.indexOf(type.toLocaleLowerCase()) !== -1
      )
      if (!hasAllowedType) return false
    }
    return true
  }

  return (
    <div
      ref={ref}
      className={`${className} ${styles.droppable} ${dragOnOver ? styles.dragOver + ' ' + styles[dragDecorator] : ''}`}
      onMouseDown={onMouseDown}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
