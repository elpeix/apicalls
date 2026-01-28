import React, { useState } from 'react'
import CollectionElement from './CollectionElement'
import styles from './Collections.module.css'
import Droppable from '../../../base/Droppable/Droppable'

export default function CollectionElements({
  elements,
  collectionId,
  path,
  update,
  onMove,
  scrolling,
  onDragStart,
  onDragEnd
}: {
  elements: (CollectionFolder | RequestType)[]
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  onMove: (moveAction: MoveAction) => void
  scrolling: boolean
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const [droppableActive, setDroppableActive] = useState(false)

  const removeElement = (element: CollectionFolder | RequestType) => {
    const index = elements.indexOf(element)
    elements.splice(index, 1)
    update()
  }

  const addRequest = (request: RequestType) => {
    elements.push(request)
    update()
  }

  const handleDragOver = () => setDroppableActive(true)
  const handleDragLeave = () => setDroppableActive(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDroppableActive(false)
    const from = JSON.parse(e.dataTransfer.getData('path'))
    const to = [...path]
    if (to.length) {
      to[to.length - 1] = { ...to[to.length - 1], type: 'folder' }
    }
    onMove({ from, to })
  }

  return (
    <>
      <Droppable
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`${styles.droppableElement} ${droppableActive ? styles.droppableActive : ''}`}
        allowedDropTypes={['path']}
      />
      {elements.map((element, i) => (
        <CollectionElement
          key={element.id}
          index={i}
          collectionId={collectionId}
          element={element}
          update={update}
          addRequest={addRequest}
          onMove={onMove}
          removeElement={removeElement}
          path={path}
          scrolling={scrolling}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </>
  )
}
