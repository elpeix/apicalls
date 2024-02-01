import { useState } from 'react'
import { CREATE_COLLECTION, REMOVE_COLLECTION, UPDATE_COLLECTION } from '../../../lib/ipcChannels'

export function useCollections(): CollectionsHook {
  const [collections, setCollections] = useState<Collection[]>([])
  const ipcRenderer = window.electron.ipcRenderer

  const create = () => {
    const newCollection: Collection = {
      id: new Date().getTime(),
      name: '',
      elements: []
    }
    setCollections([...collections, newCollection])
    return newCollection
  }

  const add = (collection: Collection) => {
    setCollections([...collections, collection])
    ipcRenderer.send(CREATE_COLLECTION, collection)
  }

  const remove = (id: Identifier) => {
    setCollections(collections.filter((collection) => collection.id !== id))
    ipcRenderer.send(REMOVE_COLLECTION, id)
  }

  const update = (collection: Collection) => {
    setCollections(collections.map((coll) => (coll.id === collection.id ? collection : coll)))
    ipcRenderer.send(UPDATE_COLLECTION, collection)
  }

  const clear = () => setCollections([])

  const getAll = () => collections

  const get = (id: Identifier) => collections.find((collection) => collection.id === id)

  const addPreRequestData = (collectionId: Identifier, preRequestData: PreRequestData) => {
    const collection = get(collectionId)
    if (collection) {
      collection.preRequestData = preRequestData
      update(collection)
    }
  }

  const removePreRequestData = (collectionId: Identifier) => {
    const collection = get(collectionId)
    if (collection) {
      delete collection.preRequestData
      update(collection)
    }
  }

  return {
    setCollections,
    create,
    add,
    remove,
    update,
    clear,
    getAll,
    get,
    addPreRequestData,
    removePreRequestData
  }
}
