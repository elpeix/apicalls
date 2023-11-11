import React, { useContext } from 'react'
import styles from './Collections.module.css'
import { AppContext } from '../../../../context/AppContext'

export default function CollectionRequest({ collectionRequest }) {

  const { tabs } = useContext(AppContext)
  const { request } = collectionRequest

  return (
    <div className={styles.request} onClick={() => tabs.openTab(collectionRequest)}>
      <div className={styles.requestMethod}>{request.method.label}</div>
      <div className={styles.requestName}>{collectionRequest.name}</div>
    </div>
  )
}
