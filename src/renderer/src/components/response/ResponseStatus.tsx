import React, { useEffect, useState } from 'react'
import { getStatusName } from '../../lib/status'
import ButtonIcon from '../base/ButtonIcon'
import styles from './Response.module.css'
import { stringifySize } from '../../lib/utils'

export default function ResponseStatus({
  status,
  time,
  size,
  consoleIsHidden,
  showConsole
}: {
  status: number
  time: number
  size: number
  consoleIsHidden: boolean
  showConsole: () => void
}) {
  const [textSize, setTextSize] = useState('0 bytes')

  useEffect(() => {
    setTextSize(stringifySize(size))
  }, [size])

  return (
    <div className={styles.statusBar}>
      <div className={styles.showConsole} onClick={showConsole}>
        {consoleIsHidden && <ButtonIcon icon="console" size={15} title="Show console" />}
      </div>
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
    </div>
  )
}
