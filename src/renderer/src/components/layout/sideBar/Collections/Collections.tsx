import React, { useContext, useState } from 'react'
import { COLLECTIONS } from '../../../../../../lib/ipcChannels'
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

  const importHanlder = () => {
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
