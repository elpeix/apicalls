import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import ButtonIcon from '../ButtonIcon'
import styles from './Console.module.css'
import { RequestContext } from '../../../context/RequestContext'
import Log from './Log'
import Menu from '../Menu/Menu'
import { MenuElement } from '../Menu/MenuElement'

export default function Console({ collapse }: { collapse: () => void }) {
  const { requestConsole } = useContext(RequestContext)

  const endRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<RequestLog[]>([])

  const [showReqs, setShowReqs] = useState(true)
  const [showLogs, setShowLogs] = useState(true)
  const [showErrors, setShowErrors] = useState(true)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 0)
  }, [])

  useEffect(() => {
    setLogs(requestConsole?.logs || [])
    scrollToBottom()
  }, [requestConsole?.logs, scrollToBottom])

  if (!requestConsole) return null

  const filteredLogs = logs.filter((log) => {
    const isError = log.type === 'error' || log.status === 999 || !!log.failure
    const isLog = log.type === 'log'
    const isRequest = !isError && !isLog

    if (isError && !showErrors) return false
    if (isLog && !showLogs) return false
    if (isRequest && !showReqs) return false

    return true
  })

  return (
    <div className={styles.console}>
      <div className={styles.header}>
        <div className={styles.title}>Console</div>
        <div className={styles.actions}>
          <Menu
            icon="filter"
            iconDirection="south"
            preventCloseOnClick={true}
            leftOffset={-83}
            topOffset={25}
          >
            <MenuElement
              title="Requests"
              icon={showReqs ? 'check' : ''}
              onClick={() => setShowReqs(!showReqs)}
            />
            <MenuElement
              title="Logs"
              icon={showLogs ? 'check' : ''}
              onClick={() => setShowLogs(!showLogs)}
            />
            <MenuElement
              title="Errors"
              icon={showErrors ? 'check' : ''}
              onClick={() => setShowErrors(!showErrors)}
            />
          </Menu>
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
      </div>

      {filteredLogs.length === 0 && <div className={styles.noLogs}>No logs</div>}
      <div className={styles.content}>
        {filteredLogs.map((log, index) => (
          <Log log={log} key={index} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
