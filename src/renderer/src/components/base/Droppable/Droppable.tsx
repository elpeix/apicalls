import React, { useState } from 'react'
import styles from './Droppable.module.css'
import { useDebounce } from '../../../hooks/useDebounce'

export default function Droppable({
  children,
  onClick,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDragOverDebounced,
  className
}: {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOverDebounced?: () => void
  children?: React.ReactNode
  className?: string
}) {
  const [dragOnOver, setDragOnOver] = useState(false)
  const debouncedDragOnOver = useDebounce(dragOnOver, 500)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(true)
    // if (debouncedDragOnOver && onDragOverDebounced) {
    //   onDragOverDebounced()
    // }
    onDragEnter?.(e)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
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
    onDrop(e)
  }

  return (
    <div
      className={`${className} ${styles.droppable} ${dragOnOver ? styles.dragOver : ''}`}
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
