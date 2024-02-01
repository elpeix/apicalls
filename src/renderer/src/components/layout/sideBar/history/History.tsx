import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import styles from './History.module.css'
import ButtonIcon from '../../../base/ButtonIcon'

export default function History() {
  const { history, tabs } = useContext(AppContext)
  const [historyItems, setHistoryItems] = useState<RequestType[]>([])
  useEffect(() => {
    if (!history) return
    setHistoryItems(history.getAll())
  }, [history])

  const formatDate = (jsonDate: string): string => {
    if (!jsonDate) return ''
    const date = new Date(jsonDate)

    let day: string | number = date.getDate()
    day = day < 10 ? `0${day}` : day
    let month: string | number = date.getMonth() + 1
    month = month < 10 ? `0${month}` : month
    let year = date.getFullYear()
    let hours: string | number = date.getHours()
    hours = hours < 10 ? `0${hours}` : hours
    let minutes: string | number = date.getMinutes()
    minutes = minutes < 10 ? `0${minutes}` : minutes
    let seconds: string | number = date.getSeconds()
    seconds = seconds < 10 ? `0${seconds}` : seconds

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const clear = () => history && history.clear()

  return (
    <>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">History</div>
        {historyItems.length > 0 && (
          <div>
            <ButtonIcon icon="clear" title="Clear history" onClick={clear} />
          </div>
        )}
      </div>
      <div className="sidePanel-content">
        {historyItems.map((historyItem, index) => (
          <div
            key={index}
            className={`sidePanel-content-item ${styles.item}`}
            onClick={() => tabs?.openTab(historyItem)}
          >
            <div className={styles.title}>
              <div className={`${styles.method} ${historyItem.request.method.value}`}>
                {historyItem.request.method?.value}
              </div>
              <div className={styles.url}>{historyItem.request.url}</div>
            </div>
            <div className={styles.date}>{formatDate(historyItem.date || '')}</div>
          </div>
        ))}
      </div>
    </>
  )
}
