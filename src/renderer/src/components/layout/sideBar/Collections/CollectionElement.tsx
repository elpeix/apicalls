import React, { useState } from 'react'
import CollectionRequest from './CollectionRequest'
import Folder from './Folder'
import Droppable from '../../../base/Droppable/Droppable'
import styles from './Collections.module.css'

export default function CollectionElement({
  element,
  index,
  collectionId,
  path,
  update,
  addRequest,
  onMove,
  removeElement,
  scrolling,
  onDragStart,
  onDragEnd
}: {
  element: CollectionFolder | RequestType
  index: number
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  addRequest: (request: RequestType) => void
  onMove: (moveAction: MoveAction) => void
  removeElement: (element: CollectionFolder | RequestType) => void
  scrolling: boolean
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const isFolder = element.type === 'folder'
  const [droppableActive, setDroppableActive] = useState(false)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    handleStartMove()
    const elementPath = [...path, { id: element.id, type: element.type }] as PathItem[]
    e.dataTransfer.setData('index', index.toString())
    e.dataTransfer.setData('type', element.type)
    e.dataTransfer.setData('path', JSON.stringify(elementPath))
    e.dataTransfer.setData('id', element.id.toString())
    onDragStart()
  }

  const handleDragOver = () => setDroppableActive(true)
  const handleDragLeave = () => setDroppableActive(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDroppableActive(false)
    try {
      onMove({
        from: JSON.parse(e.dataTransfer.getData('path')),
        to: path,
        after: element.id
      })
    } catch {
      // Invalid drop data, ignore
    }
  }

  const handleStartMove = () => {
    setTimeout(() => {
      const body = document.querySelector('body')
      body?.classList.add(styles.movingElements)
    }, 0)
  }
  const handleStopMove = () => {
    document.querySelector('body')?.classList.remove(styles.movingElements)
    onDragEnd()
  }

  return (
    <div draggable={true} onDragStart={handleDragStart} onDragEnd={handleStopMove}>
      {isFolder && (
        <Folder
          folder={element}
          collectionId={collectionId}
          path={path}
          update={update}
          onMove={onMove}
          remove={removeElement}
          scrolling={scrolling}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      )}
      {!isFolder && (
        <CollectionRequest
          collectionRequest={element}
          collectionId={collectionId}
          path={path}
          update={update}
          addRequest={addRequest}
          remove={removeElement}
          scrolling={scrolling}
        />
      )}
      <Droppable
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`${styles.droppableElement} ${droppableActive ? styles.droppableActive : ''}`}
        allowedDropTypes={['path']}
      />
    </div>
  )
}
