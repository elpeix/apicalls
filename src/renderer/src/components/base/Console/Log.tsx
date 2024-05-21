import React from 'react'
import styles from './Console.module.css'
import { getStatusName } from '../../../lib/status'

export default function Log({ log }: { log: RequestLog }) {
  return (
    <div className={styles.log}>
      <div className={`${styles.status} ${styles[getStatusName(log.status)]}`}>{log.status}</div>
      <div className={`${styles.method} ${log.method}`}>{log.method}</div>
      <div className={styles.url}>{log.url}</div>
      <div className={styles.time}>{log.time} ms</div>
    </div>
  )
}
