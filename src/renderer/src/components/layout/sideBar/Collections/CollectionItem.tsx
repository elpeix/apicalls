import React from 'react'
import styles from './Collections.module.css'

export default function CollectionItem({
  collection,
  selectCollection
}: {
  collection: Collection
  selectCollection: (collection: Collection) => void
}) {
  return (
    <div
      className={`sidePanel-content-item ${styles.item}`}
      onClick={() => selectCollection(collection)}
    >
      <div className={styles.title}>{collection.name}</div>
    </div>
  )
}
