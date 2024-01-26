import React, { useContext, useEffect, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'
import CollectionItem from './CollectionItem'
import Collection from './Collection'
import {
  GET_COLLECTIONS,
  COLLECTIONS_UPDATED,
  IMPORT_COLLECTION,
  IMPORT_COLLECTION_RESULT
} from '../../../../../../lib/ipcChannels'

export default function Collections() {
  const { collections } = useContext(AppContext)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.on(
      IMPORT_COLLECTION_RESULT,
      (_: any, result: { filePath: string; collection: Collection }) => {
        collections?.add(result.collection)
      }
    )
    ipcRenderer.send(GET_COLLECTIONS)
    ipcRenderer.on(COLLECTIONS_UPDATED, (_: any, collectionList: Collection[]) => {
      collections?.setCollections(collectionList)
    })

    return () => {
      ipcRenderer.removeAllListeners(IMPORT_COLLECTION_RESULT)
      ipcRenderer.removeAllListeners(COLLECTIONS_UPDATED)
    }
  }, [])

  const add = () => {
    if (!collections) return
    const collection = collections.create()
    setSelectedCollection(collection)
  }

  const update = (collection: Collection) => {
    if (!collections) return
    collections.update(collection)
  }

  const remove = () => {
    if (!selectedCollection || !collections) return
    collections.remove(selectedCollection.id)
    setSelectedCollection(null)
  }

  const importHanlder = () => {
    if (!collections) return
    window.electron.ipcRenderer.send(IMPORT_COLLECTION)
  }

  return (
    <>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">Collections</div>
        {!selectedCollection && (
          <>
            <div>
              <ButtonIcon icon="save" onClick={importHanlder} title="Import collection" />
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
          update={update}
          remove={remove}
        />
      )}

      {!selectedCollection && (
        <>
          <div className="sidePanel-content">
            {collections != null &&
              collections
                .getAll()
                .map((collection) => (
                  <CollectionItem
                    key={collection.id}
                    collection={collection}
                    selectCollection={setSelectedCollection}
                  />
                ))}
          </div>
        </>
      )}
    </>
  )
}
