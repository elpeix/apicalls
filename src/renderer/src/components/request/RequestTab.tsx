import React from 'react'
import styles from './Request.module.css'

export default function RequestTab({ name, count = 0 }: { name: string; count?: number }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabName}>{name}</div>
      {count > 0 && <div className={styles.tabCount}>{count}</div>}
    </div>
  )
}
