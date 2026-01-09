import React from 'react'
import type { SeparatorProps } from '../types'

export type { SeparatorProps } from '../types'

export function Separator({
  index,
  onPointerDown,
  style,
  className,
  isDragging,
  isActive,
  orientation
}: SeparatorProps) {
  const handleStyle: React.CSSProperties = {
    flex: '0 0 1px',
    touchAction: 'none',
    userSelect: 'none',
    ...style
  }

  let state = 'inactive'
  if (isDragging) {
    state = 'drag'
  } else if (isActive) {
    state = 'active'
  }

  return (
    <div
      className={`sp_separator ${orientation} ${className}`}
      style={handleStyle}
      onPointerDown={(e) => onPointerDown?.(e, index ?? 0)}
      data-separator-state={state}
      data-index={index}
    >
      <div className="inset" />
    </div>
  )
}
