import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './LinkedModal.module.css'

export default function LinkedModal({
  parentRef,
  zIndex = 1,
  className = '',
  closeModal = () => {},
  topOffset = 0,
  leftOffset = 0,
  onClick = () => {},
  useOverlay = false,
  children
}: {
  parentRef: React.RefObject<HTMLElement | null>
  zIndex?: number
  className?: string
  closeModal?: () => void
  topOffset?: number
  leftOffset?: number
  useOverlay?: boolean
  onClick?: (e: React.MouseEvent<Element>) => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  })

  useLayoutEffect(() => {
    if (ref.current) {
      setDimensions({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight
      })
    }
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect()
      setX(rect.left)
      setY(rect.top)
    }
  }, [ref, parentRef])

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      ref.current &&
      !ref.current.contains(e.target as Node) &&
      !parentRef.current?.contains(e.target as Node)
    ) {
      closeModal()
    }
  }

  const getTop = () => {
    if (y + dimensions.height + topOffset > window.innerHeight) {
      return y - dimensions.height - topOffset
    }
    if (y + topOffset < 0) {
      return 0
    }
    return y + topOffset
  }

  const getLeft = () => {
    if (x + dimensions.width + leftOffset > window.innerWidth) {
      return (
        x - dimensions.width - leftOffset + (parentRef.current ? parentRef.current.offsetWidth : 0)
      )
    }
    if (x + leftOffset < 0) {
      return 0
    }
    return x + leftOffset
  }

  return (
    <>
      {useOverlay && (
        <div className={styles.overlay} onClick={closeModal} style={{ zIndex: zIndex * 100 - 1 }} />
      )}
      <div
        ref={ref}
        className={`${className} ${styles.linkedModal}`}
        onClick={onClick}
        style={{
          top: `${getTop()}px`,
          left: `${getLeft()}px`,
          zIndex: zIndex * 100
        }}
      >
        {children}
      </div>
    </>
  )
}
