import React from 'react'
import styles from './Collections.module.css'
import Name from '../../../base/Name'
import Droppable from '../../../base/Droppable/Droppable'

export default function CollectionItem({
  collection,
  selectCollection,
  move
}: {
  collection: Collection
  selectCollection: (collection: Collection) => void
  move: (id: Identifier, toBeforeId: Identifier) => void
}) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.dataTransfer.setData('collectionId', collection.id.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const id = e.dataTransfer.getData('collectionId')
    move(id, collection.id)
  }

  return (
    <Droppable
      className={`sidePanel-content-item ${styles.item}`}
      onClick={() => selectCollection(collection)}
      draggable={true}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      allowedDropTypes={['collectionId']}
      dragDecorator="left"
    >
      <div className={styles.collectionItem}>
        <Name className={styles.title} name={collection.name} />
        {collection.description && (
          <div className={styles.collectionItemDescription}>
            {collection.description.length > 100
              ? `${collection.description.slice(0, 100)}...`
              : collection.description}
          </div>
        )}
      </div>
    </Droppable>
  )
}
