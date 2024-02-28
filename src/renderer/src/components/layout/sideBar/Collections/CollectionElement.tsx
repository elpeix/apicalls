import React from 'react'
import CollectionRequest from './CollectionRequest'
import Folder from './Folder'

export default function CollectionElement({
  element,
  index,
  collectionId,
  path,
  update,
  addRequest,
  move,
  removeElement,
  scrolling
}: {
  element: CollectionFolder | RequestType
  index: number
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  addRequest: (request: RequestType) => void
  move: (moveAction: { from: PathItem[]; to: PathItem[] }) => void
  removeElement: (element: CollectionFolder | RequestType) => void
  scrolling: boolean
}) {
  const isFolder = element.type === 'folder'

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const elementPath = [
      ...path,
      { id: element.id, type: element.type, name: element.name }
    ] as PathItem[]
    e.dataTransfer.setData('index', index.toString())
    e.dataTransfer.setData('type', element.type)
    e.dataTransfer.setData('path', JSON.stringify(elementPath))
    e.dataTransfer.setData('id', element.id.toString())
  }

  return (
    <div draggable={true} onDragStart={handleDragStart}>
      {isFolder && (
        <Folder
          folder={element}
          collectionId={collectionId}
          path={path}
          update={update}
          move={move}
          remove={removeElement}
          scrolling={scrolling}
        />
      )}
      {!isFolder && (
        <CollectionRequest
          collectionRequest={element}
          collectionId={collectionId}
          path={path}
          update={update}
          addRequest={addRequest}
          move={move}
          remove={removeElement}
          scrolling={scrolling}
        />
      )}
    </div>
  )
}
