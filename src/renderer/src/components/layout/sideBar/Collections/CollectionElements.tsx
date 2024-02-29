import React from 'react'
import CollectionElement from './CollectionElement'
import styles from './Collections.module.css'
import Droppable from '../../../base/Droppable/Droppable'

export default function CollectionElements({
  elements,
  collectionId,
  path,
  update,
  move,
  scrolling
}: {
  elements: (CollectionFolder | RequestType)[]
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  move: (moveAction: { from: PathItem[]; to: PathItem[] }) => void
  scrolling: boolean
}) {
  const removeElement = (element: CollectionFolder | RequestType) => {
    const index = elements.indexOf(element)
    elements.splice(index, 1)
    update()
  }

  const addRequest = (request: RequestType) => {
    elements.push(request)
    update()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const from = JSON.parse(e.dataTransfer.getData('path'))
    const to = [...path]
    to[to.length - 1] = { ...to[to.length - 1], type: 'collection' }
    move({ from, to })
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
      <Droppable onDrop={handleDrop} className={styles.firstElement} />
    </>
  )
}
