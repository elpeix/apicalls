import React, { CSSProperties, useLayoutEffect, useRef, useState } from 'react'
import styles from './Tooltip.module.css'
import { useTooltip } from '../../../hooks/useTooltip'

export default function Tooltip() {
  const tooltip = useTooltip()
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useLayoutEffect(() => {
    if (ref.current) {
      setDimensions({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight
      })
    }
    if (tooltip) {
      setY(tooltip.top)
      setX(tooltip.left)
    }
  }, [ref, tooltip])

  if (!tooltip) return null
  const topOffset = tooltip.height
  const leftOffset = tooltip.width

  const getTop = () => {
    if (y + dimensions.height + topOffset > window.innerHeight) {
      return y - dimensions.height + topOffset
    }
    if (y + topOffset < 0) {
      return 0
    }
    return y + topOffset
  }

  const getLeft = () => {
    if (x + dimensions.width + leftOffset > window.innerWidth) {
      return x - dimensions.width + leftOffset
    }
    if (x + leftOffset < 0) {
      return 0
    }
    return x //+ leftOffset
  }

  const style: CSSProperties = {
    position: 'absolute',
    top: getTop(),
    left: getLeft()
  }
  return (
    <div className={`${styles.tooltip} fadeIn`} style={style} ref={ref}>
      <div className={styles.content}>{tooltip.text}</div>
    </div>
  )
}
