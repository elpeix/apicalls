import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import styles from './SaveAs.module.css'
import { AppContext } from '../../../context/AppContext'
import Icon from '../../base/Icon/Icon'
import { Button } from '../../base/Buttons/Buttons'

const getFolders = (elements: (CollectionFolder | RequestType)[]) => {
  return elements
    .filter((element) => element.type === 'folder')
    .map((element) => element as CollectionFolder)
}

const getFolder = (folders: CollectionFolder[], id: Identifier) => {
  return folders.find((element) => element.id === id)
}

export default function SaveAs({
  tabId,
  onClose
}: {
  tabId: Identifier | undefined
  onClose: () => void
}) {
  const { collections, tabs } = useContext(AppContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const [collectionSelected, setCollectionSelected] = useState<Collection | null>(null)
  const [folderPath, setFolderPath] = useState<CollectionFolder[]>([])
  const [folderSelected, setFolderSelected] = useState<CollectionFolder | null>(null)
  const [requestName, setRequestName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [requestNameError, setRequestNameError] = useState(false)
  const initializedRef = useRef(false)

  const folderList = useMemo(() => {
    if (folderPath.length > 0) {
      const currentFolder = folderPath[folderPath.length - 1]
      return getFolders(currentFolder.elements)
    }
    if (collectionSelected) {
      return getFolders(collectionSelected.elements)
    }
    return []
  }, [folderPath, collectionSelected])

  useEffect(() => {
    if (initializedRef.current || !tabs || !tabId || !collections) {
      return
    }
    const tab = tabs.getTab(tabId)
    if (!tab) {
      return
    }

    let name = tab.name
    if (!name || tab.type === 'draft') {
      name = ''
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRequestName(name)
    if (!tab.collectionId) {
      initializedRef.current = true
      return
    }
    const collection = collections.get(tab.collectionId)
    if (!collection) {
      return
    }
    initializedRef.current = true
    setCollectionSelected(collection)
    const path = tab.path?.filter((pathItem) => pathItem.type === 'folder')
    if (!path) {
      return
    }
    let folders = getFolders(collection.elements)
    const newFolderPath: CollectionFolder[] = []
    for (let i = 0; i < path.length - 1; i++) {
      const folder = getFolder(folders, path[i].id)
      if (folder) {
        newFolderPath.push(folder as CollectionFolder)
        folders = getFolders(folder.elements)
      }
    }
    const folderId = path[path.length - 1]?.id
    if (folderId) {
      const folder = getFolder(folders, folderId)
      setFolderSelected(folder || null)
    }

    setFolderPath(newFolderPath)
  }, [collections, tabId, tabs])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorMessage('')
    setRequestNameError(false)
  }, [requestName, collectionSelected, folderPath, folderSelected])

  const selectCollection = (collection: Collection) => {
    setCollectionSelected(collection)
    setFolderPath([])
  }

  const openFolder = (folder: CollectionFolder) => {
    setFolderPath([...folderPath, folder])
  }

  const selectFolder = (folder: CollectionFolder) => {
    setFolderSelected(folder)
  }

  const selectFolderPath = (index: number) => {
    if (index < 0) {
      if (collectionSelected) {
        selectCollection(collectionSelected)
      }
      return
    }
    setFolderPath(folderPath.slice(0, index + 1))
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
    const requestId = crypto.randomUUID()
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
    <div className={styles.dialog}>
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
                {folderPath.length > 0 && (
                  <div
                    className={styles.folder}
                    onDoubleClick={() => selectFolderPath(folderPath.length - 2)}
                    title="Go back"
                  >
                    <Icon icon="folder" />
                    <div className={styles.name}>..</div>
                  </div>
                )}
                {folderList.map((folder: CollectionFolder) => (
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
        <Button.Cancel className={styles.cancel} onClick={onClose}>
          Cancel
        </Button.Cancel>
        <Button.Ok className={styles.save} onClick={saveHandler}>
          Save
        </Button.Ok>
      </div>
    </div>
  )
}
