import React from 'react'
import styles from './Switch.module.css'

export default function Switch({
  text,
  active,
  onChange
}: {
  text: string
  active: boolean
  onChange: (active: boolean) => void
}) {
  return (
    <div
      className={`${styles.interruptor} ${active ? styles.active : ''}`}
      onClick={() => onChange(!active)}
    >
      {text}
    </div>
  )
}
