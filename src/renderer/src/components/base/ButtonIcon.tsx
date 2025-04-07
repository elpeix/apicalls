import React from 'react'
import Icon from './Icon/Icon'

export default function ButtonIcon({
  icon,
  size = 20,
  onClick = (_: React.MouseEvent) => {},
  className = '',
  iconClassName = '',
  disabled = false,
  direction = 'south',
  title = '',
  tooltipOffsetX = 0,
  tooltipOffsetY = 0
}: {
  icon: string | number
  size?: number
  onClick?: (e: React.MouseEvent) => void
  className?: string
  iconClassName?: string
  disabled?: boolean
  direction?: 'north' | 'south' | 'east' | 'west'
  title?: string
  tooltipOffsetX?: number
  tooltipOffsetY?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`button-icon ${className}`}
      disabled={disabled}
      title={title}
      data-tooltip-offset-y={tooltipOffsetY || 0}
      data-tooltip-offset-x={tooltipOffsetX || 0}
    >
      <Icon icon={icon} size={size} direction={direction} className={iconClassName} />
    </button>
  )
}
