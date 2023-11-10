import React from 'react'
import Folder from './Folder'

export default function CollectionElement({ element }) {

  const isFolder = element.type === 'folder'


  return (
    <>
      { isFolder && <Folder folder={element} />}
      { !isFolder && <div>{element.name}</div>}
    </>
  )
}
