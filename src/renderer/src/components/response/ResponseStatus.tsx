import React, { useContext, useEffect, useState } from 'react'
import { getStatusName } from '../../lib/status'
import ButtonIcon from '../base/ButtonIcon'
import styles from './Response.module.css'
import { stringifySize } from '../../lib/utils'
import { RequestContext } from '../../context/RequestContext'

export default function ResponseStatus({
  consoleIsHidden,
  toggleConsole
}: {
  consoleIsHidden: boolean
  toggleConsole: () => void
}) {
  const { fetched, response } = useContext(RequestContext)

  const [textSize, setTextSize] = useState('0 bytes')
  const [requestFetched, setRequestFetched] = useState<FetchedType>(false)
  const [status, setStatus] = useState(0)
  const [time, setTime] = useState(0)
  const [size, setSize] = useState(0)

  useEffect(() => {
    setRequestFetched(fetched)
    setStatus(response.status)
    setTime(response.time)
    setSize(response.size)
  }, [fetched, response])

  useEffect(() => {
    setTextSize(stringifySize(size))
  }, [size])

  const showRequestFetched = requestFetched && status > 0 && status < 999

  return (
    <div className={`${styles.statusBar} ${!consoleIsHidden ? styles.opened : ''}`}>
      <div className={styles.showConsole} onClick={toggleConsole}>
        <ButtonIcon
          icon="console"
          size={15}
          title={`${consoleIsHidden ? 'Show' : 'Close'} console`}
          tooltipOffsetY={-51}
          tooltipOffsetX={-4}
        />
      </div>
      {showRequestFetched && (
        <div className={styles.status}>
          <div className={styles.item}>
            <div className={styles.name}>Status:</div>
            <div className={`${styles.value} ${styles[getStatusName(status)]}`}>{status}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.name}>Time:</div>
            <div className={styles.value}>{time} ms</div>
          </div>
          <div className={styles.item}>
            <div className={styles.name}>Size:</div>
            <div className={styles.value}>{textSize}</div>
          </div>
        </div>
      )}
    </div>
  )
}
