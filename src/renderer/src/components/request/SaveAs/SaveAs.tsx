import React, { useContext, useEffect, useRef, useState } from 'react'
import Dialog from '../../base/dialog/Dialog'
import styles from './SaveAs.module.css'
import { RequestContext } from '../../../context/RequestContext'
import { AppContext } from '../../../context/AppContext'
import Icon from '../../base/Icon/Icon'

export default function SaveAs({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
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
    if (!tabs || !tabId) return
    const tab = tabs?.getTab(tabId)
    if (!tab) return
    setRequestName(tab.name || '')
    const collection = collections
      ?.getAll()
      .find((collection) => collection.id === tab.collectionId)
    if (collection) {
      setCollectionSelected(collection)
      const path = tab.path?.filter((pathItem) => pathItem.type === 'folder')
      if (!path) {
        return
      }

      let folders = collection.elements
        .filter((element) => element.type === 'folder')
        .map((element) => element as CollectionFolder)

      // Get last folder
      const folderId = path[path.length - 1]?.id
      if (folderId) {
        const folder = folders.find((element) => element.id === folderId) as
          | CollectionFolder
          | undefined
        if (folder) {
          setFolderSelected(folder as CollectionFolder)
        }
      }

      // Get folder path
      const folderPath: CollectionFolder[] = []
      console.log('Path', path)
      for (let i = 0; i < path.length - 1; i++) {
        console.log('Path', path[i])
        const folder = folders.find((element) => element.id === path[i].id) as
          | CollectionFolder
          | undefined
        if (folder) {
          folderPath.push(folder as CollectionFolder)
          folders = folder.elements
            .filter((element) => element.type === 'folder')
            .map((element) => element as CollectionFolder)
        }
      }

      setFolderPath(folderPath)
      setFolderList(folders)
    }
  }, [collections, tabId, tabs])

  useEffect(() => {
    setErrorMessage('')
    setRequestNameError(false)
  }, [requestName, collectionSelected, folderPath, folderSelected])

  const selectCollection = (collection: Collection) => {
    setCollectionSelected(collection)
    const folders: CollectionFolder[] = collection.elements
      .filter((element) => element.type === 'folder')
      .map((element) => element as CollectionFolder)
    setFolderList(folders)
    setFolderPath([])
  }

  const openFolder = (folder: CollectionFolder) => {
    console.log(folder)
    setFolderPath([...folderPath, folder])
    const folders: CollectionFolder[] = folder.elements
      .filter((element) => element.type === 'folder')
      .map((element) => element as CollectionFolder)
    setFolderList(folders)
  }

  const selectFolder = (folder: CollectionFolder) => {
    console.log(folder)
    setFolderSelected(folder)
  }

  const selectFolderPath = (index: number) => {
    setFolderPath(folderPath.slice(0, index + 1))
    const folder = folderPath[index]
    const folders: CollectionFolder[] = folder.elements
      .filter((element) => element.type === 'folder')
      .map((element) => element as CollectionFolder)
    setFolderList(folders)
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
    const tab = tabs?.getTab(tabId)
    console.log('Save handler', folderPath)
    const path: PathItem[] = [
      ...folderPath.map((folder) => ({ id: folder.id, type: 'folder' }) as PathItem)
    ]
    if (folderSelected) {
      path.push({ id: folderSelected.id, type: 'folder' })
      console.log('Folder selected', folderSelected)
    }
    const request = {
      ...tab,
      id: new Date().getTime().toString(),
      name: requestName,
      collectionId: collectionSelected.id,
      path,
      saved: true
    } as RequestTab
    console.log('Save', collectionSelected.id, path, request)

    // TODO: Save request
    // tabs.updateTab(tabId, request)
    // collections?.saveRequest({ path, collectionId: collectionSelected.id, request })
    onSave()
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
