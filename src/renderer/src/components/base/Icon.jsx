import React from 'react'
import Icons from '../../assets/icons/icons.svg'
import useTheme from '../../hooks/useTheme'

export default function Icon({ icon, color, size=20 }) {

  const LIGHT_COLOR = '#444'
  const DARK_COLOR = '#bbb'

  const theme = useTheme()

  const getIconColor = () => {
    if (color) {
      return color
    }
    return theme === 'dark' ? DARK_COLOR : LIGHT_COLOR
  }

  return (
    <svg className={`icon icon-${icon}`} fill={getIconColor()} width={size} height={size}>
      <use xlinkHref={`${Icons}#${icon}`} />
    </svg>
  )
}
