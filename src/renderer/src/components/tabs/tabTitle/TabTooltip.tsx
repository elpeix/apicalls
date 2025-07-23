import React, { useContext } from 'react'
import LinkedModal from '../../base/linkedModal/LinkedModal'
import { AppContext } from '../../../context/AppContext'
import styles from './TabTitle.module.css'
import Icon from '../../base/Icon/Icon'

export default function TabTooltip({
  tabRef,
  tab
}: {
  tabRef: React.RefObject<HTMLDivElement | null>
  tab: RequestTab
}) {
  const { collections } = useContext(AppContext)

  const collection = tab.collectionId ? collections?.get(tab.collectionId) : null
  const collectionName = collection?.name

  return (
    <LinkedModal
      parentRef={tabRef}
      topOffset={31}
      leftOffset={-1}
      className={`${styles.tooltip} fadeIn`}
    >
      {collectionName && (
        <div>
          <span className={styles.collection}>{collectionName}</span>
        </div>
      )}
      <div>
        <span className={tab.request.method.value}>{tab.request.method.label}</span> -{' '}
        {tab.request.url}
      </div>
      {tab.description && (
        <div className={styles.description}>
          <Icon icon="file" className={styles.icon} />
          <div className={styles.text}>{tab.description}</div>
        </div>
      )}
    </LinkedModal>
  )
}
