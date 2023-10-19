import React from 'react'
import Icons from '../../assets/icons/icons.svg'

export default function Icon({ icon, color='#bbb', size=20 }) {
  return (
    <svg className={`icon icon-${icon}`} fill={color} width={size} height={size}>
      <use xlinkHref={`${Icons}#${icon}`} />
    </svg>
  )
}
