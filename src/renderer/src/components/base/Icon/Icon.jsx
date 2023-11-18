import React from 'react'
import Icons from '../../../assets/icons/icons.svg'
import useTheme from '../../../hooks/useTheme'
import styles from './Icon.module.css'

export default function Icon({ 
  icon,
  color='',
  size=20,
  spin=false,
  direction='south',
}) {

  const LIGHT_COLOR = '#444'
  const DARK_COLOR = '#bbb'

  const { getTheme } = useTheme()

  const getIconColor = () => {
    if (color) {
      return color
    }
    return getTheme(LIGHT_COLOR, DARK_COLOR)
  }

  const className = `${styles.icon} icon-${icon} ${spin ? styles.spin : ''} ${styles[direction]}`

  return (
    <svg
      className={className} 
      fill={getIconColor()}
      width={size}
      height={size}>
      <use xlinkHref={`${Icons}#${icon}`} />
    </svg>
  )
}
