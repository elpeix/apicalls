import React from 'react'
import styles from './Tooltip.module.css'

export default function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
