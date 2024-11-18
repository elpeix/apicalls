import React from 'react'
import styles from './HorizontalScroll.module.css'

export default function HorizontalScroll({
  className = '',
  children
}: {
  className?: string
  children: React.ReactNode
}) {
  const onWheel = (e: React.WheelEvent) => {
    const el = e.currentTarget
    const scrollLeft = el.scrollLeft
    el.scrollTo({
      left: scrollLeft + e.deltaY * 0.4,
      behavior: 'instant'
    })
  }
  return (
    <div className={`${styles.scrollable} ${className}`} onWheel={onWheel}>
      {children}
    </div>
  )
}
