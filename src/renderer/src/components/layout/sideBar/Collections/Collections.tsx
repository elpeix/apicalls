import React, { useContext, useState } from 'react'
import { IMPORT_COLLECTION } from '../../../../../../lib/ipcChannels'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import Collection from './Collection'
import CollectionItem from './CollectionItem'

export default function Collections() {
  const { collections } = useContext(AppContext)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

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
