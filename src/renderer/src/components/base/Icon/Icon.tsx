import React from 'react'
import Icons from '../../../assets/icons/icons.svg'
import useTheme from '../../../hooks/useTheme'
import styles from './Icon.module.css'
import { LIGHT_MODE_COLOR, DARK_MODE_COLOR } from '../../../constant'

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
  const { getTheme } = useTheme()

  const getIconColor = (): string => {
    if (color) {
      return color
    }
    return getTheme(LIGHT_MODE_COLOR, DARK_MODE_COLOR)
  }

  const className = `${styles.icon} icon-${icon} ${spin ? styles.spin : ''} ${styles[direction]}`

  return (
    <svg className={className} fill={getIconColor()} width={size} height={size}>
      <use xlinkHref={`${Icons}#${icon}`} />
    </svg>
  )
}
