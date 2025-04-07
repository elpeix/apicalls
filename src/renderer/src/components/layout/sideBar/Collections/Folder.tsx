import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import { createFolder, createRequest } from '../../../../lib/factory'
import ButtonIcon from '../../../base/ButtonIcon'
import EditableName from '../../../base/EditableName/EditableName'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import CollectionElements from './CollectionElements'
import styles from './Collections.module.css'
import Droppable from '../../../base/Droppable/Droppable'

export default function Folder({
  folder,
  collectionId,
  path,
  update,
  onMove,
  remove,
  scrolling
}: {
  folder: CollectionFolder
  collectionId: Identifier
  path: PathItem[]
  update: () => void
  onMove: (moveAction: MoveAction) => void
  remove: (folder: CollectionFolder) => void
  scrolling: boolean
}) {
  const { application, tabs } = useContext(AppContext)
  const [expanded, setExpanded] = useState(folder.expanded || false)
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    setExpanded(folder.expanded || false)
  }, [folder.expanded])

  const folderPath = [...path, { id: folder.id, type: 'folder' }] as PathItem[]

  const toggleExpand = () => expandFolder(!expanded)

  const expandFolder = (expanded: boolean) => {
    folder.expanded = expanded
    update()
    setExpanded(expanded)
  }

  const handleAddFolder = () => {
    expandFolder(true)
    application.showPrompt({
      message: 'Folder name:',
      placeholder: 'Folder name',
      confirmName: 'Add',
      onConfirm: (name: string) => {
        application.hidePrompt()
        folder.elements.push(createFolder(name))
        update()
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const handleRemoveFolder = () => {
    application.showConfirm({
      message: `Are you sure you want to remove folder ${folder.name}?`,
      confirmName: 'Remove',
      confirmColor: 'danger',
      onConfirm: () => {
        application.hideConfirm()
        remove(folder)
      },
      onCancel: () => application.hideConfirm()
    })
  }

  const changeName = (name: string) => {
    folder.name = name
    update()
  }

  const handleAddRequest = () => {
    expandFolder(true)
    application.showPrompt({
      message: 'Request name:',
      placeholder: 'Request name',
      confirmName: 'Add',
      onConfirm: (name: string) => {
        application.hidePrompt()
        const request = createRequest({
          name,
          type: 'collection'
        })
        folder.elements.push(request)
        tabs?.openTab({
          request,
          collectionId,
          path: [
            ...folderPath,
            {
              id: request.id,
              type: 'request'
            }
          ]
        })
        update()
      },
      onCancel: () => application.hidePrompt()
    })
  }

  const handleDragOverDebounced = () => {
    expandFolder(true)
  }

  return (
    <>
      <Droppable
        className={styles.folder}
        onDragOverDebounced={handleDragOverDebounced}
        dragDecorator="none"
        allowedDropTypes={['path']}
      >
        <div className={`${styles.folderHeader} ${expanded ? styles.expanded : ''} `}>
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
              className={`${styles.folderName} ${editingName ? styles.editing : ''}`}
              update={changeName}
              onBlur={() => setEditingName(false)}
            />
          </div>
          <Menu
            className={styles.menu}
            iconClassName={styles.menuIcon}
            showMenuClassName={styles.menuActive}
            isMoving={scrolling}
            leftOffset={-91}
            topOffset={25}
          >
            <MenuElement icon="edit" title="Rename" onClick={() => setEditingName(true)} />
            <MenuElement icon="folder" title="Add folder" onClick={handleAddFolder} />
            <MenuElement icon="file" title="Add request" onClick={handleAddRequest} />
            <MenuSeparator />
            <MenuElement
              icon="delete"
              title="Remove"
              className={styles.remove}
              onClick={handleRemoveFolder}
            />
          </Menu>
        </div>
        {expanded && folder.elements && (
          <div className={styles.folderContent}>
            <CollectionElements
              collectionId={collectionId}
              elements={folder.elements}
              update={update}
              onMove={onMove}
              path={folderPath}
              scrolling={scrolling}
            />
          </div>
        )}
      </Droppable>
    </>
  )
}
