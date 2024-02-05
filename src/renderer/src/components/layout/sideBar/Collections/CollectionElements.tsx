import React from 'react'
import CollectionElement from './CollectionElement'

export default function CollectionElements({
  elements,
  path,
  update
}: {
  elements: (CollectionFolder | RequestType)[]
  path: PathItem[]
  update: () => void
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

  const move = (moveAction: { from: PathItem[]; to: PathItem[] }) => {
    console.log('move', moveAction)
    // TODO: implement move
  }

  return (
    <>
      {elements.map((element, i) => (
        <CollectionElement
          key={i}
          index={i}
          element={element}
          update={update}
          addRequest={addRequest}
          move={move}
          removeElement={removeElement}
          path={path}
        />
      ))}
    </>
  )
}
