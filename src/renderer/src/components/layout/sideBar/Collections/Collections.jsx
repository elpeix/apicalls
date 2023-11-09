import React, { useContext, useState } from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import { AppContext } from '../../../../context/AppContext'
import CollectionItem from './CollectionItem'
import Collection from './Collection'

export default function Collections() {

  const { collections } = useContext(AppContext)
  const [selectedCollection, setSelectedCollection] = useState(null)

  const add = () => {
    const collection = collections.create()
    setSelectedCollection(collection)
  }

  const update = (collection) =>  collections.update(collection)

  const remove = () => {
    collections.remove(selectedCollection.id)
    setSelectedCollection(null)
  }

  return (
    <>
      <div className='sidePanel-header'>
        <div className='sidePanel-header-title'>Collections</div>
        { !selectedCollection && (
          <div><ButtonIcon icon='more' onClick={add} /></div>
        )}
      </div>
      
      { selectedCollection && (
        <Collection
          collection={selectedCollection}
          back={() => setSelectedCollection(null)}
          update={update}
          remove={remove}
        />
      )}

      { !selectedCollection && (
        <div className='sidePanel-content'>
          {collections.getAll().map(collection => (
            <CollectionItem key={collection.id} collection={collection} selectCollection={setSelectedCollection} />
          ))}
        </div>
      )}
    </>
  )
}
