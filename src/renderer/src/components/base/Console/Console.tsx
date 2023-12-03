import React, { useContext, useEffect, useRef, useState } from 'react'
import { RequestContext } from '../../../context/RequestContext'
import { getStatusName } from '../../../lib/status'
import ButtonIcon from '../ButtonIcon'
import styles from './Console.module.css'

export default function Console({ collapse }: {
  collapse: () => void
}) {

  const { console } = useContext(RequestContext)
  const endRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<RequestLog[]>([])
  useEffect(() => {
    setLogs(console.logs)
    scrollToBottom()
  }, [console.logs])

  const scrollToBottom = () => {
    if (endRef.current){
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.console}>
      <div className={styles.header} ref={endRef}>
        <div className={styles.title}>Console</div>
        <div className={styles.clear}>
          <ButtonIcon icon='clear' onClick={console.clear} disabled={console.logs.length === 0} />
        </div>
        <div className={styles.close}>
          <ButtonIcon icon='close' onClick={collapse} />
        </div>
      </div>

      {console.logs.length === 0 && (
        <div className={styles.noLogs}>No logs</div>
      )}
      <div className={styles.content}>
        {logs.map((log, index) => (
          <div key={index} className={styles.log}>
            <div className={`${styles.status} ${styles[getStatusName(log.status)]}`}>{log.status}</div>
            <div className={`${styles.method} ${log.method}`}>{log.method}</div>
            <div className={styles.url}>{log.url}</div>
            <div className={styles.time}>{log.time} ms</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
