import React from 'react'
import styles from './Switch.module.css'

export default function Switch({
  text,
  active,
  reverse = false,
  onChange
}: {
  text: string
  active: boolean | undefined
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
