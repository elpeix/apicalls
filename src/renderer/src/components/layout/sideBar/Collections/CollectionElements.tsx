import React from 'react'
import CollectionElement from './CollectionElement'

export default function CollectionElements({
  elements,
  update
}: {
  elements: (CollectionFolder | RequestType)[]
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

  return (
    <>
      {elements.map((element, i) => (
        <CollectionElement
          key={i}
          element={element}
          update={update}
          removeElement={removeElement}
          addRequest={addRequest}
        />
      ))}
    </>
  )
}
