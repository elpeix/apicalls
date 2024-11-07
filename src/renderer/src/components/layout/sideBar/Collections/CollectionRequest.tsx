import React, { useContext, useState } from 'react'
import styles from './Collections.module.css'
import { AppContext } from '../../../../context/AppContext'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import EditableName from '../../../base/EditableName/EditableName'
import Confirm from '../../../base/PopupBoxes/Confirm'
import Droppable from '../../../base/Droppable/Droppable'
import { REMOVE_COLOR } from '../../../../constant'

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
  const requestPath = [
    ...path,
    {
      id: collectionRequest.id,
      type: 'request'
    }
  ] as PathItem[]

  const clickHandler = (e: React.MouseEvent) => {
    if (tabs) {
      tabs.openTab({
        request: collectionRequest,
        shiftKey: e.shiftKey,
        collectionId: collectionId,
        path: requestPath
      })
    }
  }
  const changeName = (name: string) => {
    collectionRequest.name = name
    tabs?.renameTab(collectionRequest.id, name)
    update()
  }

  const handleConfirmRemove = () => {
    setShowRemove(false)
    remove(collectionRequest)
  }

  const duplicate = (request: RequestType) => {
    addRequest({ ...request, id: Date.now().toString(), name: `${request.name} copy` })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    move({
      from: JSON.parse(e.dataTransfer.getData('path')),
      to: requestPath
    })
  }

  return (
    <>
      <Droppable
        className={styles.request}
        onClick={clickHandler}
        onDrop={handleDrop}
        allowedDropTypes={['path']}
      >
        <div className={`${styles.requestMethod} ${request.method.value}`}>
          {request.method.label}
        </div>
        <EditableName
          name={collectionRequest.name || 'New request'}
          editMode={editingName}
          update={changeName}
          onBlur={() => setEditingName(false)}
          editOnDoubleClick={true}
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
          <MenuElement
            icon="delete"
            title="Remove"
            color={REMOVE_COLOR}
            onClick={() => setShowRemove(true)}
          />
        </Menu>
      </Droppable>

      {showRemove && (
        <Confirm
          message={`Are you sure you want to remove request ${collectionRequest.name}?`}
          confirmName="Remove"
          confirmColor={REMOVE_COLOR}
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowRemove(false)}
        />
      )}
    </>
  )
}
