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

  return (
    <div>
      {elements.map((element, i) => (
        <CollectionElement
          key={i}
          element={element}
          update={update}
          removeElement={removeElement}
        />
      ))}
    </div>
  )
}
