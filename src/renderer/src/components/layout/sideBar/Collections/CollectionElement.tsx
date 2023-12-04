import React from 'react'
import CollectionRequest from './CollectionRequest'
import Folder from './Folder'

export default function CollectionElement({ element } : {
  element: CollectionFolder | RequestCollection
}) {

  const isFolder = element.type === 'folder'

  return (
    <>
      { isFolder && <Folder folder={element} />}
      { !isFolder && <CollectionRequest collectionRequest={element} />}
    </>
  )
}
