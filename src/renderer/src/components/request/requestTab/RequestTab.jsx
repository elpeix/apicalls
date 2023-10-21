import React from 'react'
import styles from './RequestTab.module.css'

export default function RequestTab({ name, count }) {
  return (
    <div className={styles.content}>
      <div className={styles.name}>{name}</div>
      {count > 0 && <div className={styles.count}>{count}</div>}
    </div>
  )
}
