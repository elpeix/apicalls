import React, { useContext, useState } from 'react'
import styles from './Collections.module.css'
import { AppContext } from '../../../../context/AppContext'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import EditableName from '../../../base/EditableName/EditableName'
import Confirm from '../../../base/PopupBoxes/Confirm'

export default function CollectionRequest({
  collectionRequest,
  collectionId,
  path,
  update,
  addRequest,
  move,
  remove,
  scrolling
}: {
  collectionRequest: RequestType
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  remove: (request: RequestType) => void
  move: (moveAction: { from: PathItem[]; to: PathItem[] }) => void
  addRequest: (request: RequestType) => void
  scrolling: boolean
}) {
  const { tabs } = useContext(AppContext)
  const { request } = collectionRequest
  const [editingName, setEditingName] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const [dragOnOver, setDragOnOver] = useState(false)
  const requestPath = [
    ...path,
    {
      id: collectionRequest.id,
      type: 'request',
      name: collectionRequest.name
    }
  ] as PathItem[]

  const clickHandler = () => {
    if (tabs) {
      tabs.openTab(collectionRequest, collectionId, requestPath)
    }
  }
  const changeName = (name: string) => {
    collectionRequest.name = name
    update()
  }

  const handleConfirmRemove = () => {
    setShowRemove(false)
    remove(collectionRequest)
  }

  const duplicate = (request: RequestType) => {
    addRequest({ ...request, id: Date.now().toString(), name: `${request.name} copy` })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOnOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOnOver(false)
    move({
      from: JSON.parse(e.dataTransfer.getData('path')),
      to: requestPath
    })
  }

  return (
    <>
      <div
        className={`${styles.request} ${styles.droppable} ${dragOnOver ? styles.dragOver : ''}`}
        onClick={clickHandler}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`${styles.requestMethod} ${request.method.value}`}>
          {request.method.label}
        </div>
        <EditableName
          name={collectionRequest.name || 'New request'}
          editMode={editingName}
          update={changeName}
          onBlur={() => setEditingName(false)}
        />
        <Menu
          className={styles.menu}
          iconClassName={styles.menuIcon}
          showMenuClassName={styles.menuActive}
          isMoving={scrolling}
        >
          <MenuElement icon="edit" title="Rename" onClick={() => setEditingName(true)} />
          <MenuElement icon="copy" title="Duplicate" onClick={() => duplicate(collectionRequest)} />
          <MenuSeparator />
          <MenuElement icon="delete" title="Remove" onClick={() => setShowRemove(true)} />
        </Menu>
      </div>

      {showRemove && (
        <Confirm
          message={`Are you sure you want to remove request ${collectionRequest.name}?`}
          confirmName="Remove"
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowRemove(false)}
        />
      )}
    </>
  )
}
