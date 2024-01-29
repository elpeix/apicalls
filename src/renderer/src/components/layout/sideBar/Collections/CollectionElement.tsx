import React from 'react'
import CollectionRequest from './CollectionRequest'
import Folder from './Folder'

export default function CollectionElement({
  element,
  update,
  removeElement
}: {
  element: CollectionFolder | RequestType
  update: () => void
  removeElement: (element: CollectionFolder | RequestType) => void
}) {
  const isFolder = element.type === 'folder'

  return (
    <>
      {isFolder && <Folder folder={element} update={update} remove={removeElement} />}
      {!isFolder && (
        <CollectionRequest collectionRequest={element} update={update} remove={removeElement} />
      )}
    </>
  )
}
