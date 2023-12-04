import React, { useContext } from 'react'
import styles from './Collections.module.css'
import { AppContext } from '../../../../context/AppContext'

export default function CollectionRequest({
  collectionRequest
}: {
  collectionRequest: RequestType
}) {
  const { tabs } = useContext(AppContext)
  const { request } = collectionRequest

  const clickHandler = () => {
    if (tabs) {
      tabs.openTab(collectionRequest)
    }
  }

  return (
    <div className={styles.request} onClick={clickHandler}>
      <div className={`${styles.requestMethod} ${request.method.value}`}>
        {request.method.label}
      </div>
      <div className={styles.requestName}>{collectionRequest.name}</div>
    </div>
  )
}
