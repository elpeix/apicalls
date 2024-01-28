import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './LinkedModal.module.css'

export default function LinkedModal({
  parentRef,
  zIndex = 1,
  className = '',
  closeModal = () => {},
  topOffset = 0,
  leftOffset = 0,
  children
}: {
  parentRef: React.RefObject<HTMLElement>
  zIndex?: number
  className?: string
  closeModal?: () => void
  topOffset?: number
  leftOffset?: number
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
      setX(parentRef.current.offsetLeft + leftOffset)
      setY(parentRef.current.offsetTop + parentRef.current.offsetHeight + topOffset)
    }
  }, [ref, parentRef, topOffset, leftOffset])

  const handleOutsideClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      closeModal()
    }
  }

  const getTop = () => {
    if (y + dimensions.height > window.innerHeight) {
      return y - dimensions.height
    }
    if (y < 0) {
      return 0
    }
    return y
  }

  const getLeft = () => {
    if (x + dimensions.width > window.innerWidth) {
      return x - dimensions.width + (parentRef.current ? parentRef.current.offsetWidth : 0)
    }
    if (x < 0) {
      return 0
    }
    return x
  }

  return (
    <div
      ref={ref}
      className={`${className} ${styles.linkedModal}`}
      style={{
        top: `${getTop()}px`,
        left: `${getLeft()}px`,
        zIndex: zIndex * 1000
      }}
    >
      {children}
    </div>
  )
}
