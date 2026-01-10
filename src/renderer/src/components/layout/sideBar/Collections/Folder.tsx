import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import { createFolder, createRequest } from '../../../../lib/factory'
import ButtonIcon from '../../../base/ButtonIcon'
import Droppable from '../../../base/Droppable/Droppable'
import EditableName from '../../../base/EditableName/EditableName'
import Menu from '../../../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import CollectionElements from './CollectionElements'
import styles from './Collections.module.css'

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
  const { application, tabs, collections } = useContext(AppContext)
  const [expanded, setExpanded] = useState(folder.expanded || false)
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    setExpanded(folder.expanded || false)
  }, [folder.expanded])

  const folderPath = useMemo(
    () => [...path, { id: folder.id, type: 'folder' }] as PathItem[],
    [path, folder.id]
  )

  const expandFolder = useCallback(
    (newExpandedState: boolean) => {
      // eslint-disable-next-line
      folder.expanded = newExpandedState
      update()
      setExpanded(newExpandedState)
    },
    [folder, update]
  )

  const toggleExpand = useCallback(() => expandFolder(!expanded), [expandFolder, expanded])

  const handleAddFolder = useCallback(() => {
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
  }, [expandFolder, application, folder, update])

  const handleRemoveFolder = useCallback(() => {
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
  }, [application, folder, remove])

  const changeName = useCallback(
    (name: string) => {
      // eslint-disable-next-line
      folder.name = name
      update()
      setEditingName(false)
    },
    [folder, update]
  )

  const handleAddRequest = useCallback(() => {
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
  }, [expandFolder, application, folder, tabs, collectionId, folderPath, update])

  const handleDragOverDebounced = useCallback(() => {
    expandFolder(true)
  }, [expandFolder])

  const handleDuplicateFolder = useCallback(() => {
    application.showConfirm({
      message: `Are you sure you want to duplicate folder ${folder.name}?`,
      confirmName: 'Duplicate',
      onConfirm: () => {
        application.hideConfirm()
        collections?.duplicateFolder(collectionId, folder.id, path)
      },
      onCancel: () => application.hideConfirm()
    })
  }, [application, folder.name, folder.id, collections, collectionId, path])

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
            leftOffset={-90}
            topOffset={24}
          >
            <MenuElement icon="edit" title="Rename" onClick={() => setEditingName(true)} />
            <MenuElement icon="more" title="Add request" onClick={handleAddRequest} />
            <MenuElement icon="folder" title="Add folder" onClick={handleAddFolder} />
            <MenuElement icon="copy" title="Duplicate" onClick={handleDuplicateFolder} />
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
