import React, { useContext, useEffect } from 'react'
import { COLLECTIONS, WORKSPACES } from '../../../../../../lib/ipcChannels'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Collection from './Collection'
import CollectionItem from './CollectionItem'
import Icon from '../../../base/Icon/Icon'

export default function Collections() {
  const { application, collections } = useContext(AppContext)
  const { showAlert } = application

  const selectedCollection = collections?.selectedCollection ?? null

  const setSelectedCollection = (collection: Collection | null) => {
    collections?.select(collection?.id ?? null)
  }

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    const handleImportFailure = (_: unknown, message: string) => {
      showAlert({ message })
    }
    const handleWorkspaceChanged = () => {
      collections?.select(null)
    }
    ipcRenderer?.on(COLLECTIONS.importFailure, handleImportFailure)
    ipcRenderer?.on(WORKSPACES.changed, handleWorkspaceChanged)
    return () => {
      ipcRenderer?.removeListener(COLLECTIONS.importFailure, handleImportFailure)
      ipcRenderer?.removeListener(WORKSPACES.changed, handleWorkspaceChanged)
    }
  }, [showAlert, collections])

  const add = () => {
    if (!collections) return
    application.showPrompt({
      message: 'Enter a name for the new collection:',
      placeholder: 'Collection name',
      onConfirm(name: string) {
        const collection = collections.create(name)
        setSelectedCollection(collection)
        application.hidePrompt()
      },
      onCancel() {
        application.hidePrompt()
      }
    })
  }

  const importHandler = () => {
    if (!collections) return
    window.electron?.ipcRenderer.send(COLLECTIONS.import)
  }

  return (
    <>
      <div className="sidePanel-header">
        <div
          className={`sidePanel-header-title ${selectedCollection ? 'cursor-pointer' : ''}`}
          onClick={() => setSelectedCollection(null)}
        >
          Collections
        </div>
        {!selectedCollection && (
          <>
            <div>
              <ButtonIcon icon="save" onClick={importHandler} title="Import a collection" />
            </div>
            <div>
              <ButtonIcon icon="more" onClick={add} title="Create new collection" />
            </div>
          </>
        )}
      </div>

      {selectedCollection && (
        <Collection
          collection={selectedCollection}
          back={() => setSelectedCollection(null)}
          onRemove={() => setSelectedCollection(null)}
        />
      )}

      {!selectedCollection && (
        <div className="sidePanel-content">
          {collections != null &&
            collections
              .getAll()
              .map((collection) => (
                <CollectionItem
                  key={collection.id}
                  collection={collection}
                  selectCollection={setSelectedCollection}
                  move={collections.move}
                />
              ))}
          {collections?.getAll().length === 0 && (
            <div className="sidePanel-content-empty">
              <div className="sidePanel-content-empty-text">
                You don&apos;t have any collections yet.
              </div>
              <div className="sidePanel-content-empty-actions">
                <button onClick={add} className="sidePanel-content-empty-button">
                  <Icon icon="more" />
                  <span className="sidePanel-content-empty-button-label">
                    Create new collection
                  </span>
                </button>
                <button onClick={importHandler} className="sidePanel-content-empty-button">
                  <Icon icon="save" />
                  <span className="sidePanel-content-empty-button-label">Import a collection</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
