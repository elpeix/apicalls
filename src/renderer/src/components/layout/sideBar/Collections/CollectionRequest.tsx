import React, { useContext, useState } from 'react'
import styles from './Collections.module.css'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'

export default function CollectionRequest({
  collectionRequest
}: {
  collectionRequest: RequestType
}) {
  const { tabs, collections } = useContext(AppContext)
  const { request } = collectionRequest

  const [editMode, setEditMode] = useState(false)

  const clickHandler = () => {
    if (tabs) {
      tabs.openTab(collectionRequest)
    }
  }

  const editHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditMode(true)
  }

  return (
    <>
      {!editMode && (
        <div className={styles.request} onClick={clickHandler}>
          <div className={`${styles.requestMethod} ${request.method.value}`}>
            {request.method.label}
          </div>
          <div className={styles.requestName}>{collectionRequest.name}</div>
          <div className={styles.edit}>
            <ButtonIcon icon="edit" onClick={editHandler} />
          </div>
        </div>
      )}
      {editMode && (
        <div className={`${styles.request} ${styles.edit}`}>
          <div className={`${styles.requestMethod} ${request.method.value}`}>
            {request.method.label}
          </div>
          <input
            type="text"
            className={styles.requestName}
            value={collectionRequest.name}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditMode(false)
                if (collections) {
                  console.log('update collection request')
                }
                return
              }
              if (e.key === 'Escape') {
                setEditMode(false)
                return
              }
            }}
            autoFocus
            onBlur={() => {
              setEditMode(false)
              if (collections) {
                console.log('update collection request')
              }
            }}
          />
        </div>
      )}
    </>
  )
}
