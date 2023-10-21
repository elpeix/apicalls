import React, { useContext } from 'react'
import { AppContext } from '../../../../context/AppContext'
import styles from './History.module.css'

export default function History() {

  const { history } = useContext(AppContext)

  return (
    <div className={styles.history}>
      {history.getAll().map((historyItem, index) => (
        <div key={index}>
          <div>{historyItem.request.method?.value} - {historyItem.request.url}</div>
          <div className={styles.date}>{historyItem.date}</div>
        </div>
      ))}
    </div>
  )
}
