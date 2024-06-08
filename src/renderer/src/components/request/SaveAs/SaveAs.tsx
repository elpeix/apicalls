import React, { useContext, useEffect, useRef, useState } from 'react'
import Dialog from '../../base/dialog/Dialog'
import styles from './SaveAs.module.css'
import { RequestContext } from '../../../context/RequestContext'
import { AppContext } from '../../../context/AppContext'
import Icon from '../../base/Icon/Icon'

const getFolders = (elements: (CollectionFolder | RequestType)[]) => {
  return elements
    .filter((element) => element.type === 'folder')
    .map((element) => element as CollectionFolder)
}

const getFolder = (folders: CollectionFolder[], id: Identifier) => {
  return folders.find((element) => element.id === id)
}

export default function SaveAs({ onClose }: { onClose: () => void }) {
  const { collections, tabs } = useContext(AppContext)
  const { tabId } = useContext(RequestContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const [collectionSelected, setCollectionSelected] = useState<Collection | null>(null)
  const [folderPath, setFolderPath] = useState<CollectionFolder[]>([])
  const [folderList, setFolderList] = useState<CollectionFolder[]>([])
  const [folderSelected, setFolderSelected] = useState<CollectionFolder | null>(null)
  const [requestName, setRequestName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [requestNameError, setRequestNameError] = useState(false)

  useEffect(() => {
    if (!tabs || !tabId) {
      return
    }
    const tab = tabs?.getTab(tabId)
    if (!tab) {
      return
    }
    let name = tab.name
    if (!name || tab.type === 'draft') {
      name = ''
    }
    setRequestName(name)
    if (!tab.collectionId) {
      return
    }
    const collection = collections?.get(tab.collectionId)
    if (!collection) {
      return
    }
    setCollectionSelected(collection)
    const path = tab.path?.filter((pathItem) => pathItem.type === 'folder')
    if (!path) {
      return
    }
    let folders = getFolders(collection.elements)
    const folderPath: CollectionFolder[] = []
    for (let i = 0; i < path.length - 1; i++) {
      const folder = getFolder(folders, path[i].id)
      if (folder) {
        folderPath.push(folder as CollectionFolder)
        folders = getFolders(folder.elements)
      }
    }
    const folderId = path[path.length - 1]?.id
    if (folderId) {
      const folder = getFolder(folders, folderId)
      setFolderSelected(folder || null)
    }

    setFolderPath(folderPath)
    setFolderList(folders)
  }, [collections, tabId, tabs])

  useEffect(() => {
    setErrorMessage('')
    setRequestNameError(false)
  }, [requestName, collectionSelected, folderPath, folderSelected])

  const selectCollection = (collection: Collection) => {
    setCollectionSelected(collection)
    setFolderList(getFolders(collection.elements))
    setFolderPath([])
  }

  const openFolder = (folder: CollectionFolder) => {
    setFolderPath([...folderPath, folder])
    setFolderList(getFolders(folder.elements))
  }

  const selectFolder = (folder: CollectionFolder) => {
    setFolderSelected(folder)
  }

  const selectFolderPath = (index: number) => {
    setFolderPath(folderPath.slice(0, index + 1))
    const folder = folderPath[index]
    setFolderList(getFolders(folder.elements))
  }

  const saveHandler = () => {
    if (!tabs || !tabId) return
    if (!collectionSelected) {
      setErrorMessage('Select a collection')
      return
    }
    if (!requestName) {
      setErrorMessage('Request name is required')
      setRequestNameError(true)
      inputRef.current?.focus()
      return
    }
    const path: PathItem[] = [
      ...folderPath.map((folder) => ({ id: folder.id, type: 'folder' }) as PathItem)
    ]
    if (folderSelected) {
      path.push({ id: folderSelected.id, type: 'folder' })
    }
    const requestId = new Date().getTime() + '_' + Number(Math.random() * 1000).toFixed(0)
    path.push({ id: requestId, type: 'request' })
    const tab = tabs?.getTab(tabId)
    const request = {
      type: 'collection',
      id: requestId,
      name: requestName,
      date: new Date().toISOString(),
      request: { ...tab?.request },
      active: true,
      saved: true,
      collectionId: collectionSelected.id,
      path
    } as RequestTab

    tabs.updateTab(tabId, request)
    collections?.saveRequest({ path, collectionId: collectionSelected.id, request })
    onClose()
  }

  return (
    <Dialog onClose={onClose} className={styles.dialog}>
      <div className={styles.header}>
        <label className={styles.label} htmlFor="requestName">
          Request name
        </label>
        <div className={`${styles.input} ${requestNameError ? styles.inputError : ''}`}>
          <input
            id="requestName"
            ref={inputRef}
            type="text"
            placeholder="Request name"
            value={requestName}
            autoFocus
            onChange={(e) => setRequestName(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.collections}>
          {collections?.getAll().map((collection) => (
            <div
              key={collection.id}
              className={`${styles.collection} ${collectionSelected?.id === collection.id ? styles.selected : ''}`}
              onClick={() => selectCollection(collection)}
            >
              <Icon icon="collection" />
              <div className={styles.name}>{collection.name}</div>
            </div>
          ))}
        </div>
        <div className={styles.collectionFolders}>
          {collectionSelected && (
            <>
              <div className={styles.foldersPath}>
                <div className={styles.path} onClick={() => selectCollection(collectionSelected)}>
                  {collectionSelected.name || 'No name'}
                </div>
                {folderPath.map((folder, index) => (
                  <div
                    key={folder.id}
                    className={styles.path}
                    onClick={() => selectFolderPath(index)}
                  >
                    <div className={styles.name}>{folder.name || folder.id}</div>
                  </div>
                ))}
              </div>

              <div className={styles.folders}>
                {folderList.map((folder) => (
                  <div
                    key={folder.id}
                    className={`${styles.folder} ${folderSelected?.id === folder.id ? styles.selected : ''}`}
                    onClick={() => selectFolder(folder)}
                    onDoubleClick={() => openFolder(folder)}
                  >
                    <Icon icon="folder" />
                    <div className={styles.name}>{folder.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {!collectionSelected && <div className={styles.noCollection}>Select a collection</div>}
        </div>
      </div>

      <div className={styles.footer}>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        <button className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.save} onClick={saveHandler}>
          Save
        </button>
      </div>
    </Dialog>
  )
}
