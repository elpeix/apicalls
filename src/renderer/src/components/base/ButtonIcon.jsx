import React from 'react'
import Icon from './Icon/Icon'

export default function ButtonIcon({ 
  icon,
  color='',
  size=20,
  onClick=()=>{},
  className='',
  disabled=false,
  direction='south',
  title=''
}) {
  return (
    <button
      onClick={onClick}
      className={`button-icon ${className}`}
      disabled={disabled}
      title={title}
    >
      <Icon icon={icon} color={color} size={size} direction={direction} />
    </button>
  )
}
