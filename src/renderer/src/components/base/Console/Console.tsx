import React, { useContext, useEffect, useRef, useState } from 'react'
import ButtonIcon from '../ButtonIcon'
import styles from './Console.module.css'
import { RequestContext } from '../../../context/RequestContext'
import Log from './Log'

export default function Console({ collapse }: { collapse: () => void }) {
  const { requestConsole } = useContext(RequestContext)

  const endRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<RequestLog[]>([])
  useEffect(() => {
    if (!requestConsole) return
    setLogs(requestConsole.logs)
    scrollToBottom()
  }, [requestConsole])

  if (!requestConsole) return null

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.console}>
      <div className={styles.header} ref={endRef}>
        <div className={styles.title}>Console</div>
        <div className={styles.clear}>
          <ButtonIcon
            icon="clear"
            onClick={requestConsole.clear}
            disabled={logs.length === 0}
            title="Clear"
          />
        </div>
        <div className={styles.close}>
          <ButtonIcon icon="close" onClick={collapse} title="Close" />
        </div>
      </div>

      {logs.length === 0 && <div className={styles.noLogs}>No logs</div>}
      <div className={styles.content}>
        {logs.map((log, index) => (
          <Log log={log} key={index} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
