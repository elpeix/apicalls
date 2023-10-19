import React, { useContext, useEffect, useRef, useState } from 'react'
import { RequestContext } from '../../../context/RequestContext'
import { getStatusName } from '../../../lib/status'
import ButtonIcon from '../ButtonIcon'
import styles from './Console.module.css'

export default function Console({ collapse }) {

  const context = useContext(RequestContext)
  const endRef = useRef(null)
  const [logs, setLogs] = useState([])
  useEffect(() => {
    setLogs(context.console.logs)
    scrollToBottom()
  }, [context])

  const scrollToBottom = () => endRef.current.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className={styles.console}>
      <div className={styles.header} ref={endRef}>
        <div className={styles.title}>Console</div>
        <div className={styles.clear}>
          <ButtonIcon icon='clear' onClick={context.console.clear}  disabled={context.console.logs.length === 0} />
        </div>
        <div className={styles.close}>
          <ButtonIcon icon='close' onClick={collapse} />
        </div>
      </div>

      {context.console.logs.length === 0 && (
        <div className={styles.noLogs}>No logs</div>
      )}
      <div className={styles.content}>
        {logs.map((log, index) => (
          <div key={index} className={styles.log}>
            <div className={`${styles.status} ${styles[getStatusName(log.status)]}`}>{log.status}</div>
            <div className={styles.method}>{log.method}</div>
            <div className={styles.url}>{log.url}</div>
            <div className={styles.time}>{log.time} ms</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
