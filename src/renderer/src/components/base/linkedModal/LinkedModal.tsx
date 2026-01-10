import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './LinkedModal.module.css'
import { ACTIONS } from '../../../../../lib/ipcChannels'

export default function LinkedModal({
  parentRef,
  zIndex = 1,
  className = '',
  closeModal = () => {},
  topOffset = 0,
  leftOffset = 0,
  onClick = () => {},
  useOverlay = false,
  preventKeyClose = false,
  allowOutsideClick = false,
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
  preventKeyClose?: boolean
  allowOutsideClick?: boolean
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [parentWidth, setParentWidth] = useState(0)

  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      if (!allowOutsideClick) {
        e.preventDefault()
      }
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !parentRef.current?.contains(e.target as Node)
      ) {
        closeModal()
      }
    },
    [closeModal, ref, parentRef, allowOutsideClick]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  })

  useEffect(() => {
    if (preventKeyClose) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.once(ACTIONS.escape, closeModal)
    return () => ipcRenderer?.removeListener(ACTIONS.escape, closeModal)
  }, [closeModal, preventKeyClose])

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
      setParentWidth(parentRef.current.offsetWidth)
    }
  }, [ref, parentRef])

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
      return x - dimensions.width - leftOffset + parentWidth
    }
    if (x + leftOffset < 0) {
      return 0
    }
    return x + leftOffset
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    closeModal()
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClick(e)
  }

  return (
    <>
      {useOverlay && (
        <div
          className={styles.overlay}
          onClick={handleOverlayClick}
          style={{ zIndex: zIndex * 100 - 1 }}
        />
      )}
      <div
        ref={ref}
        className={`${className} ${styles.linkedModal}`}
        onClick={handleModalClick}
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
