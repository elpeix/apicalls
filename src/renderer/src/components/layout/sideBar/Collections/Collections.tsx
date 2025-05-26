import React, { useContext, useEffect } from 'react'
import { COLLECTIONS, WORKSPACES } from '../../../../../../lib/ipcChannels'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Collection from './Collection'
import CollectionItem from './CollectionItem'

export default function Collections() {
  const { application, collections } = useContext(AppContext)

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(COLLECTIONS.importFailure, (_: unknown, message: string) => {
      application.showAlert({ message })
    })
    ipcRenderer?.on(WORKSPACES.changed, () => {
      collections?.select(null)
    })
    return () => {
      ipcRenderer?.removeAllListeners(COLLECTIONS.importFailure)
      ipcRenderer?.removeAllListeners(WORKSPACES.changed)
    }
  })

  const selectedCollection = collections?.selectedCollection
  const setSelectedCollection = (collection: Collection | null) => {
    collections?.select(collection ? collection.id : null)
  }

  const add = () => {
    if (!collections) return
    const collection = collections.create()
    setSelectedCollection(collection)
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
              <ButtonIcon icon="save" onClick={importHandler} title="Import collection" />
            </div>
            <div>
              <ButtonIcon icon="more" onClick={add} title="New collection" />
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
        </div>
      )}
    </>
  )
}
