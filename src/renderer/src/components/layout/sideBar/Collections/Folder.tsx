import React, { useContext, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Collections.module.css'
import { MenuElement, MenuSeparator } from '../../../base/Menu/MenuElement'
import Menu from '../../../base/Menu/Menu'
import FolderCreator from './FolderCreator'
import { createFolder, createRequest } from '../../../../lib/factory'
import Confirm from '../../../base/PopupBoxes/Confirm'
import CollectionElements from './CollectionElements'
import EditableName from '../../../base/EditableName/EditableName'
import { AppContext } from '../../../../context/AppContext'
import RequestCreator from './RequestCreator'

export default function Folder({
  folder,
  update,
  remove
}: {
  folder: CollectionFolder
  update: () => void
  remove: (folder: CollectionFolder) => void
}) {
  const { tabs } = useContext(AppContext)
  const [expanded, setExpanded] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showRemoveFolder, setShowRemoveFolder] = useState(false)
  const [showCreateRequest, setShowCreateRequest] = useState(false)

  const toggleExpand = () => setExpanded(!expanded)

  const handleAddFolder = () => {
    setExpanded(true)
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
    setExpanded(true)
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

  return (
    <>
      <div className={styles.folder}>
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
            <CollectionElements elements={folder.elements} update={update} />
          </div>
        )}
      </div>

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
