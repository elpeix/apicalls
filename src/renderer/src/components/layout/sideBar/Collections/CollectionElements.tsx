import React, { useState } from 'react'
import CollectionElement from './CollectionElement'
import styles from './Collections.module.css'

export default function CollectionElements({
  elements,
  collectionId,
  path,
  update,
  scrolling
}: {
  elements: (CollectionFolder | RequestType)[]
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  scrolling: boolean
}) {
  const [dragOnOver, setDragOnOver] = useState(false)
  const removeElement = (element: CollectionFolder | RequestType) => {
    const index = elements.indexOf(element)
    elements.splice(index, 1)
    update()
  }

  const addRequest = (request: RequestType) => {
    elements.push(request)
    update()
  }

  const move = (moveAction: { from: PathItem[]; to: PathItem[] }) => {
    console.log('move', moveAction)
    // TODO: implement move
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(false)
    move({
      from: JSON.parse(e.dataTransfer.getData('path')),
      to: []
    })
  }

  return (
    <>
      {elements.map((element, i) => (
        <CollectionElement
          key={i}
          index={i}
          collectionId={collectionId}
          element={element}
          update={update}
          addRequest={addRequest}
          move={move}
          removeElement={removeElement}
          path={path}
          scrolling={scrolling}
        />
      ))}
      <div
        className={`${styles.firstElement} ${styles.droppable} ${dragOnOver ? styles.dragOver : ''}`}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </>
  )
}
