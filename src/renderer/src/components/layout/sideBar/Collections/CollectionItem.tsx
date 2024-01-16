import React from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Collections.module.css'

export default function CollectionItem({
  collection,
  selectCollection
}: {
  collection: Collection
  selectCollection: (collection: Collection) => void
}) {
  console.log('collection', collection)
  return (
    <div
      className={`sidePanel-content-item ${styles.item}`}
      onClick={() => selectCollection(collection)}
    >
      <div className={styles.title}>{collection.name}</div>
      <div className={styles.edit}>
        <ButtonIcon icon="edit" onClick={() => selectCollection(collection)} />
      </div>
    </div>
  )
}
