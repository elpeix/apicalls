import React from 'react'
import Icon from './Icon'

export default function ButtonIcon({ 
  icon,
  color='#bbb',
  size=20,
  onClick,
  className='',
  disabled=false,
  title
}) {
  return (
    <button
      onClick={onClick}
      className={`button-icon ${className}`}
      disabled={disabled}
      title={title}
    >
      <Icon icon={icon} color={color} size={size}  />
    </button>
  )
}
