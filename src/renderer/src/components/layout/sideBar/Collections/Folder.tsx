import React, { useContext, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import { createFolder, createRequest } from '../../../../lib/factory'
import ButtonIcon from '../../../base/ButtonIcon'
import EditableName from '../../../base/EditableName/EditableName'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import Confirm from '../../../base/PopupBoxes/Confirm'
import CollectionElements from './CollectionElements'
import styles from './Collections.module.css'
import FolderCreator from './FolderCreator'
import RequestCreator from './RequestCreator'
import Droppable from '../../../base/Droppable/Droppable'

export default function Folder({
  folder,
  collectionId,
  path,
  update,
  move,
  remove,
  scrolling
}: {
  folder: CollectionFolder
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  move: (moveAction: { from: PathItem[]; to: PathItem[] }) => void
  remove: (folder: CollectionFolder) => void
  scrolling: boolean
}) {
  const { tabs } = useContext(AppContext)
  const [expanded, setExpanded] = useState(folder.expanded || false)
  const [editingName, setEditingName] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showRemoveFolder, setShowRemoveFolder] = useState(false)
  const [showCreateRequest, setShowCreateRequest] = useState(false)

  const folderPath = [...path, { id: folder.id, type: 'folder', name: folder.name }] as PathItem[]

  const toggleExpand = () => expandFolder(!expanded)

  const expandFolder = (expanded: boolean) => {
    folder.expanded = expanded
    update()
    setExpanded(expanded)
  }

  const handleAddFolder = () => {
    expandFolder(true)
    setShowCreateFolder(true)
  }

  const createFolderHandler = (name: string) => {
    setShowCreateFolder(false)
    folder.elements.push(createFolder(name))
    update()
  }

  const removeFolderHandler = () => {
    setShowRemoveFolder(false)
    remove(folder)
  }

  const changeName = (name: string) => {
    folder.name = name
    update()
  }

  const handleAddRequest = () => {
    expandFolder(true)
    setShowCreateRequest(true)
  }

  const createRequestHandler = (name: string) => {
    setShowCreateRequest(false)
    const request = createRequest({
      name,
      type: 'collection'
    })
    folder.elements.push(request)
    update()
    tabs?.openTab(request)
  }

  const handleDragOverDebounced = () => {
    expandFolder(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    move({
      from: JSON.parse(e.dataTransfer.getData('path')),
      to: folderPath
    })
  }

  return (
    <>
      <Droppable
        className={styles.folder}
        onDragOverDebounced={handleDragOverDebounced}
        onDrop={handleDrop}
      >
        <div className={`${styles.folderHeader} ${expanded ? styles.expanded : ''}`}>
          <div>
            <ButtonIcon
              icon="arrow"
              direction={expanded ? 'south' : 'east'}
              onClick={toggleExpand}
            />
          </div>
          <div className={styles.folderTitle} onClick={toggleExpand}>
            <EditableName
              name={folder.name}
              editMode={editingName}
              update={changeName}
              onBlur={() => setEditingName(false)}
            />
          </div>
          <Menu
            className={styles.menu}
            iconClassName={styles.menuIcon}
            showMenuClassName={styles.menuActive}
            isMoving={scrolling}
          >
            <MenuElement icon="edit" title="Rename" onClick={() => setEditingName(true)} />
            <MenuElement icon="folder" title="Add folder" onClick={handleAddFolder} />
            <MenuElement icon="file" title="Add request" onClick={handleAddRequest} />
            <MenuSeparator />
            <MenuElement icon="delete" title="Remove" onClick={() => setShowRemoveFolder(true)} />
          </Menu>
        </div>
        {expanded && folder.elements && (
          <div className={styles.folderContent}>
            <CollectionElements
              collectionId={collectionId}
              elements={folder.elements}
              update={update}
              move={move}
              path={folderPath}
              scrolling={scrolling}
            />
          </div>
        )}
      </Droppable>

      {showCreateFolder && (
        <FolderCreator onCancel={() => setShowCreateFolder(false)} onCreate={createFolderHandler} />
      )}

      {showCreateRequest && (
        <RequestCreator
          onCancel={() => setShowCreateRequest(false)}
          onCreate={createRequestHandler}
        />
      )}

      {showRemoveFolder && (
        <Confirm
          message={`Are you sure you want to remove folder ${folder.name}?`}
          confirmName="Remove"
          onConfirm={removeFolderHandler}
          onCancel={() => setShowRemoveFolder(false)}
        />
      )}
    </>
  )
}
