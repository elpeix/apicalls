import React from 'react'
import Icons from '../../assets/icons/icons.svg'
import useTheme from '../../hooks/useTheme'

export default function Icon({ icon, color, size=20 }) {

  const LIGHT_COLOR = '#444'
  const DARK_COLOR = '#bbb'

  const { getTheme } = useTheme()

  const getIconColor = () => {
    if (color) {
      return color
    }
    return getTheme(LIGHT_COLOR, DARK_COLOR)
  }

  return (
    <svg className={`icon icon-${icon}`} fill={getIconColor()} width={size} height={size}>
      <use xlinkHref={`${Icons}#${icon}`} />
    </svg>
  )
}
