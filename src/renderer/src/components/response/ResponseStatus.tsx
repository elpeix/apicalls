import React, { useContext, useMemo } from 'react'
import { getStatusName } from '../../lib/status'
import ButtonIcon from '../base/ButtonIcon'
import styles from './Response.module.css'
import { stringifySize } from '../../lib/utils'
import { ResponseContext } from '../../context/RequestContext'

export default function ResponseStatus({
  consoleIsHidden,
  toggleConsole
}: {
  consoleIsHidden: boolean
  toggleConsole: () => void
}) {
  const { fetched, response } = useContext(ResponseContext)

  const status = response.status
  const time = response.time
  const size = response.size

  const textSize = useMemo(() => stringifySize(size), [size])

  const showRequestFetched = fetched && status > 0 && status < 999

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
