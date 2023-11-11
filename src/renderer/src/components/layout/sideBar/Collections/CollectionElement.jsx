import React from 'react'
import Folder from './Folder'
import CollectionRequest from './CollectionRequest'

export default function CollectionElement({ element }) {

  const isFolder = element.type === 'folder'


  return (
    <>
      { isFolder && <Folder folder={element} />}
      { !isFolder && <CollectionRequest collectionRequest={element} />}
    </>
  )
}
