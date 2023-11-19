import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './LinkedModal.module.css'

export default function LinkedModal({
  parentRef,
  zIndex=1,
  className='', 
  closeModal = () => {},
  topOffset=0,
  leftOffset=0,
  children
}) {

  const ref = useRef(null)
  const [dimensions, setDimensions] = useState({ width:0, height: 0 })
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
    setX(parentRef.current.offsetLeft + leftOffset)
    setY(parentRef.current.offsetTop + parentRef.current.offsetHeight + topOffset)
  }, [ref, parentRef, topOffset, leftOffset])

  const handleOutsideClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      closeModal()
    }
  }

  const getTop = () => {
    if (y + dimensions.height > window.innerHeight) {
      return y - dimensions.height
    }
    return y
  }

  const getLeft = () => {
    if (x + dimensions.width > window.innerWidth) {
      return x - dimensions.width + parentRef.current.offsetWidth
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
      }}>
      {children}
    </div>
  )
}
