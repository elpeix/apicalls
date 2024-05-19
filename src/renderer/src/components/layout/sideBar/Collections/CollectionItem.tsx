import React from 'react'
import styles from './Collections.module.css'
import Name from '../../../base/Name'

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
      <Name className={styles.title} name={collection.name} />
    </div>
  )
}
