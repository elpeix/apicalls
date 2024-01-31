import React from 'react'
import CollectionRequest from './CollectionRequest'
import Folder from './Folder'

export default function CollectionElement({
  element,
  update,
  addRequest,
  removeElement
}: {
  element: CollectionFolder | RequestType
  update: () => void
  addRequest: (request: RequestType) => void
  removeElement: (element: CollectionFolder | RequestType) => void
}) {
  const isFolder = element.type === 'folder'

  return (
    <>
      {isFolder && <Folder folder={element} update={update} remove={removeElement} />}
      {!isFolder && (
        <CollectionRequest
          collectionRequest={element}
          update={update}
          remove={removeElement}
          addRequest={addRequest}
        />
      )}
    </>
  )
}
