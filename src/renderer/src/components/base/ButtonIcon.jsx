import React from 'react'
import Icon from './Icon'

export default function ButtonIcon({ 
  icon,
  color='#bbb',
  size=20,
  onClick,
  className='',
  disabled=false
}) {
  return (
    <button
      onClick={onClick}
      className={`button-icon ${className}`}
      disabled={disabled}
    >
      <Icon icon={icon} color={color} size={size}  />
    </button>
  )
}
