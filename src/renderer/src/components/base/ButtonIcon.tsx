import React from 'react'
import Icon from './Icon/Icon'

export default function ButtonIcon({
  icon,
  color = '',
  size = 20,
  onClick = (_: React.MouseEvent) => {},
  className = '',
  iconClassName = '',
  disabled = false,
  direction = 'south',
  title = ''
}: {
  icon: string | number
  color?: string
  size?: number
  onClick?: (e: React.MouseEvent) => void
  className?: string
  iconClassName?: string
  disabled?: boolean
  direction?: 'north' | 'south' | 'east' | 'west'
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`button-icon ${className}`}
      disabled={disabled}
      title={title}
    >
      <Icon icon={icon} color={color} size={size} direction={direction} className={iconClassName} />
    </button>
  )
}
