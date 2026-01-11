import React, { useContext, useMemo } from 'react'
import { AppContext } from '../../../../context/AppContext'
import styles from './History.module.css'
import ButtonIcon from '../../../base/ButtonIcon'

export default function History() {
  const { history, tabs } = useContext(AppContext)

  const historyItems = useMemo(() => {
    return history?.getAll() || []
  }, [history])

  const formatDate = (jsonDate: string): string => {
    if (!jsonDate) return ''
    const date = new Date(jsonDate)

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

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
      <div className={`sidePanel-content ${styles.content}`}>
        {historyItems.length === 0 && (
          <div className="sidePanel-content-empty">
            <div className="sidePanel-content-empty-text">No history items.</div>
          </div>
        )}
        {historyItems.map((historyItem) => (
          <div
            key={historyItem.id}
            className={`sidePanel-content-item ${styles.item}`}
            onClick={() => tabs?.openTab({ request: historyItem })}
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
