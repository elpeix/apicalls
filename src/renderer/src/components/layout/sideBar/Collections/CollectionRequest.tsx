import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './Collections.module.css'
import { AppContext } from '../../../../context/AppContext'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import EditableName from '../../../base/EditableName/EditableName'
import Droppable from '../../../base/Droppable/Droppable'

export default function CollectionRequest({
  collectionRequest,
  collectionId,
  path,
  update,
  addRequest,
  remove,
  scrolling
}: {
  collectionRequest: RequestType
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  remove: (request: RequestType) => void
  addRequest: (request: RequestType) => void
  scrolling: boolean
}) {
  const { application, tabs, appSettings } = useContext(AppContext)
  const { request } = collectionRequest
  const [editingName, setEditingName] = useState(false)
  const [active, setActive] = useState(false)
  const requestPath = [
    ...path,
    {
      id: collectionRequest.id,
      type: 'request'
    }
  ] as PathItem[]

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const activeRequest = tabs?.getActiveRequest()
    if (
      ref.current &&
      activeRequest &&
      activeRequest.collectionId === collectionId &&
      activeRequest.id === collectionRequest.id
    ) {
      if (appSettings?.settings?.scrollToActiveRequest ?? true) {
        ref.current.scrollIntoView({
          behavior: 'instant',
          block: 'nearest'
        })
      }
      setActive(true)
    } else {
      setActive(false)
    }
  }, [collectionRequest, collectionId, tabs])

  const clickHandler = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (active) return
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

  const handleRemove = () => {
    application.showConfirm({
      message: `Are you sure you want to remove request ${collectionRequest.name}?`,
      confirmName: 'Remove',
      confirmColor: 'danger',
      onConfirm: () => {
        application.hidePrompt()
        remove(collectionRequest)
      },

      onCancel: () => application.hidePrompt()
    })
  }

  const duplicate = (request: RequestType) => {
    addRequest({ ...request, id: Date.now().toString(), name: `${request.name} copy` })
  }

  return (
    <Droppable
      className={`${styles.request} ${active ? styles.requestActive : ''}`}
      onClick={clickHandler}
      allowedDropTypes={['path']}
      dragDecorator="none"
      ref={ref}
    >
      <div className={`${styles.requestMethod} ${request.method.value}`}>
        {request.method.label}
      </div>
      <EditableName
        name={collectionRequest.name || 'New request'}
        editMode={editingName}
        update={changeName}
        className={styles.requestName}
        onBlur={() => setEditingName(false)}
        editOnDoubleClick={true}
      />
      <Menu
        className={styles.menu}
        iconClassName={styles.menuIcon}
        showMenuClassName={styles.menuActive}
        isMoving={scrolling}
        leftOffset={-75}
        topOffset={25}
      >
        <MenuElement icon="edit" title="Rename" onClick={() => setEditingName(true)} />
        <MenuElement icon="copy" title="Duplicate" onClick={() => duplicate(collectionRequest)} />
        <MenuSeparator />
        <MenuElement
          icon="delete"
          title="Remove"
          className={styles.remove}
          onClick={handleRemove}
        />
      </Menu>
    </Droppable>
  )
}
