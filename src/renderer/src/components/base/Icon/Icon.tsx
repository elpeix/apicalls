import React from 'react'
import Icons from '../../../assets/icons/icons.svg'
import styles from './Icon.module.css'

export default function Icon({
  icon,
  className = '',
  size = 20,
  spin = false,
  direction = 'south'
}: {
  icon: string | number
  className?: string
  size?: number
  spin?: boolean
  direction?: 'north' | 'south' | 'east' | 'west'
}) {
  const cls = `${styles.icon} ${className} icon-${icon} ${spin ? styles.spin : ''} ${styles[direction]}`

  return (
    <svg className={cls} fill="currentcolor" width={size} height={size}>
      <use xlinkHref={`${Icons}#${icon}`} />
    </svg>
  )
}
