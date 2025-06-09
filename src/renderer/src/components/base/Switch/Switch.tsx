import React from 'react'
import styles from './Switch.module.css'

export default function Switch({
  text,
  active = false,
  reverse = false,
  onChange
}: {
  text: string
  active?: boolean
  reverse?: boolean
  onChange: (active: boolean) => void
}) {
  return (
    <div
      className={`${styles.interruptor} ${active ? styles.active : ''} ${reverse ? styles.reverse : ''}`}
      onClick={() => onChange(!active)}
    >
      <div className={styles.switch} />
      <div className={styles.text}>{text}</div>
    </div>
  )
}
