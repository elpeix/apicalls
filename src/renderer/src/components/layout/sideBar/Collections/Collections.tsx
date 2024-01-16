import React, { useContext, useEffect, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'
import CollectionItem from './CollectionItem'
import Collection from './Collection'

export default function Collections() {
  const { collections } = useContext(AppContext)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.on(
      'import-openapi-result',
      (_: any, result: { filePath: string; collection: Collection }) => {
        console.log('files', result)
        collections?.add(result.collection)
      }
    )
    return () => ipcRenderer.removeAllListeners('import-openapi-result')
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
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('import-openapi', {
      title: 'Import Collection',
      properties: ['openFile'],
      fileTypes: [
        {
          name: 'JSON',
          extensions: ['json']
        }
      ]
    })
  }

  return (
    <>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">Collections</div>
        {!selectedCollection && (
          <>
            <div>
              <ButtonIcon icon="save" onClick={importHanlder} />
            </div>
            <div>
              <ButtonIcon icon="more" onClick={add} />
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
