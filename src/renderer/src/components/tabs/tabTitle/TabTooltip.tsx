import React, { useContext } from 'react'
import LinkedModal from '../../base/linkedModal/LinkedModal'
import { AppContext } from '../../../context/AppContext'
import styles from './TabTitle.module.css'

export default function TabTooltip({
  tabRef,
  tab
}: {
  tabRef: React.RefObject<HTMLDivElement>
  tab: RequestTab
}) {
  const { collections } = useContext(AppContext)

  const collection = tab.collectionId ? collections?.get(tab.collectionId) : null
  const collectionName = collection?.name

  return (
    <LinkedModal parentRef={tabRef} topOffset={35} leftOffset={3} className={styles.tooltip}>
      {collectionName && (
        <div>
          <span className={styles.collection}>{collectionName}</span>
        </div>
      )}
      <div>
        <span className={tab.request.method.value}>{tab.request.method.label}</span> -{' '}
        {tab.request.url}
      </div>
    </LinkedModal>
  )
}
