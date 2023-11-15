import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import styles from './History.module.css'
import ButtonIcon from '../../../base/ButtonIcon'

export default function History() {

  const { history, tabs } = useContext(AppContext)
  const [historyItems, setHistoryItems] = useState([])
  useEffect(() => {
    setHistoryItems(history.getAll())
  }, [history])

  const formatDate = (jsonDate) => {
    const date = new Date(jsonDate)
    
    let day = date.getDate()
    day = day < 10 ? `0${day}` : day
    let month = date.getMonth() + 1
    month = month < 10 ? `0${month}` : month
    let year = date.getFullYear()
    let hours = date.getHours()
    hours = hours < 10 ? `0${hours}` : hours
    let minutes = date.getMinutes()
    minutes = minutes < 10 ? `0${minutes}` : minutes
    let seconds = date.getSeconds()
    seconds = seconds < 10 ? `0${seconds}` : seconds

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const clear = () =>  history.clear()

  return (
    <>
      <div className='sidePanel-header'>
        <div className='sidePanel-header-title'>History</div>
        { historyItems.length > 0 && (
          <div>
            <ButtonIcon icon='clear' title='clear' onClick={clear} />
          </div>
        )}
      </div>
      <div className='sidePanel-content'>
        {historyItems.map((historyItem, index) => (
          <div key={index} className={`sidePanel-content-item ${styles.item}`} onClick={() => tabs.openTab(historyItem)}>
            <div className={styles.title}>
              <div className={`${styles.method} ${historyItem.request.method.value}`}>{historyItem.request.method?.value}</div>
              <div className={styles.url}>{historyItem.request.url}</div>
            </div>
            <div className={styles.date}>
              {formatDate(historyItem.date)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
