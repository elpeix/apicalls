import { useState } from 'react'
import { COLLECTIONS } from '../../../lib/ipcChannels'
import * as factory from '../lib/factory'
import { addFolderToCollection, findContainer } from '../lib/collectionUtils'

export function useCollections(): CollectionsHookType {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [updateTime, setUpdateTime] = useState(0)
  const ipcRenderer = window.electron?.ipcRenderer

  const create = () => {
    const newCollection: Collection = {
      id: new Date().getTime(),
      name: '',
      elements: []
    }
    add(newCollection)
    return newCollection
  }

  const add = (collection: Collection) => {
    updateCollections([...collections, collection])
    ipcRenderer?.send(COLLECTIONS.create, collection)
  }

  const remove = (id: Identifier) => {
    updateCollections(collections.filter((collection) => collection.id !== id))
    ipcRenderer?.send(COLLECTIONS.remove, id)
  }

  const update = (collection: Collection) => {
    updateCollections(
      collections.map((coll) => {
        if (coll.id === collection.id) {
          return collection
        }
        return coll
      })
    )
    ipcRenderer?.send(COLLECTIONS.update, collection)
  }

  const updateCollections = (newCollections: Collection[]) => {
    setCollections(newCollections)
    setUpdateTime(new Date().getTime())
  }

  const clear = () => updateCollections([])

  const getAll = () => collections

  const get = (id: Identifier) => collections.find((collection) => collection.id === id)

  const setPreRequest = (collectionId: Identifier, preRequest: PreRequest) => {
    const collection = get(collectionId)
    if (collection) {
      collection.preRequest = preRequest
      update(collection)
    }
  }

  const clearPreRequest = (collectionId: Identifier) => {
    const collection = get(collectionId)
    if (collection) {
      delete collection.preRequest
      update(collection)
    }
  }

  const saveRequest = ({ path, collectionId, request }: SaveRequest) => {
    const collection = get(collectionId)
    if (collection) {
      addRequestToCollection({ collection, request, path })
    }
  }

  const addRequestToCollection = ({
    collection,
    request,
    path
  }: {
    collection: Collection
    request: RequestType
    path: PathItem[]
  }) => {
    const newCollection = { ...collection }
    let elements = newCollection.elements
    const pathCopy = [...path]
    while (pathCopy.length > 0) {
      const item = pathCopy.shift()
      if (!item) {
        throw new Error('Path item not found')
      }
      const index = elements.findIndex((element) => element.id === item.id)
      if (index === -1) {
        elements.push({
          type: request.type,
          id: request.id,
          name: request.name,
          date: request.date,
          request: request.request
        })
      } else if (pathCopy.length === 0) {
        elements.splice(index, 1, request)
      } else {
        elements = (elements[index] as CollectionFolder).elements
        if (elements === undefined) {
          console.warn('Can not save request', {
            index,
            path: [...pathCopy]
          })
          break
        }
      }
    }
    update(newCollection)
  }

  const move = (id: Identifier, toBeforeId: Identifier) => {
    const newCollections = [...collections]
    const fromIndex = newCollections.findIndex((t) => t.id == id)
    const toIndex = newCollections.findIndex((t) => t.id == toBeforeId)
    const [removed] = newCollections.splice(fromIndex, 1)
    newCollections.splice(toIndex, 0, removed)
    updateCollections(newCollections)
    ipcRenderer?.send(COLLECTIONS.updateAll, newCollections)
  }

  const getEnvironmentId = (collectionId: Identifier) => {
    const collection = get(collectionId)
    return collection?.environmentId
  }

  const setEnvironmentId = (collectionId: Identifier, environmentId?: Identifier) => {
    const collection = get(collectionId)
    if (!collection) {
      return
    }
    collection.environmentId = environmentId
    update(collection)
  }

  const select = (collectionId: Identifier | null) => {
    if (collectionId === selectedCollection?.id) {
      return
    }
    if (collectionId === null) {
      setSelectedCollection(null)
      return
    }
    const collection = get(collectionId)
    setSelectedCollection(collection || null)
  }

  const duplicateFolder = (collectionId: Identifier, folderId: Identifier, path: PathItem[]) => {
    const collections = getAll()
    const collectionIndex = collections.findIndex((c) => c.id === collectionId)
    if (collectionIndex === -1) {
      return
    }

    const collection = collections[collectionIndex]
    const parentFolder = findContainer(collection, path) as CollectionFolder

    if (!parentFolder) {
      return
    }

    const folderToDuplicate = parentFolder.elements.find(
      (e) => e.id === folderId && e.type === 'folder'
    ) as CollectionFolder | undefined

    if (!folderToDuplicate) {
      return
    }

    const duplicatedFolder = factory.duplicateFolder(folderToDuplicate)

    const newCollection = addFolderToCollection(collection, path, duplicatedFolder, folderId)
    update(newCollection)
  }

  return {
    setCollections,
    create,
    add,
    remove,
    update,
    clear,
    move,
    getAll,
    get,
    setPreRequest,
    clearPreRequest,
    saveRequest,
    updateTime,
    getEnvironmentId,
    setEnvironmentId,
    duplicateFolder,
    select,
    selectedCollection
  }
}
