import React from 'react'
import Icons from '../../../assets/icons/icons.svg'
import styles from './Icon.module.css'
import { REMOVE_COLOR } from '../../../constant'

export default function Icon({
  icon,
  color = '',
  size = 20,
  spin = false,
  direction = 'south'
}: {
  icon: string | number
  color?: string
  size?: number
  spin?: boolean
  direction?: 'north' | 'south' | 'east' | 'west'
}) {
  const getIconColor = (): string => {
    if (color === REMOVE_COLOR) {
      return styles.danger
    }
    return ''
  }

  const className = `${styles.icon} ${getIconColor()} icon-${icon} ${spin ? styles.spin : ''} ${styles[direction]}`

  return (
    <svg className={className} fill="currentcolor" width={size} height={size}>
      <use xlinkHref={`${Icons}#${icon}`} />
    </svg>
  )
}
