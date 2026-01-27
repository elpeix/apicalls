import { useCallback, useMemo, useState } from 'react'
import { COLLECTIONS } from '../../../lib/ipcChannels'
import * as factory from '../lib/factory'
import { addFolderToCollection, findContainer } from '../lib/collectionUtils'

export function useCollections(): CollectionsHookType {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [updateTime, setUpdateTime] = useState(0)
  const ipcRenderer = window.electron?.ipcRenderer

  const updateCollections = useCallback((newCollections: Collection[]) => {
    setCollections(newCollections)
    setUpdateTime(new Date().getTime())
  }, [])

  const add = useCallback(
    (collection: Collection) => {
      updateCollections([...collections, collection])
      ipcRenderer?.send(COLLECTIONS.create, collection)
    },
    [collections, ipcRenderer, updateCollections]
  )

  const create = useCallback(
    (name?: string) => {
      const newCollection: Collection = {
        id: crypto.randomUUID(),
        name: name || '',
        elements: []
      }
      add(newCollection)
      return newCollection
    },
    [add]
  )

  const remove = useCallback(
    (id: Identifier) => {
      updateCollections(collections.filter((collection) => collection.id !== id))
      ipcRenderer?.send(COLLECTIONS.remove, id)
    },
    [collections, ipcRenderer, updateCollections]
  )

  const update = useCallback(
    (collection: Collection) => {
      updateCollections(
        collections.map((coll) => {
          if (coll.id === collection.id) {
            return collection
          }
          return coll
        })
      )
      ipcRenderer?.send(COLLECTIONS.update, collection)
    },
    [collections, ipcRenderer, updateCollections]
  )

  const clear = useCallback(() => updateCollections([]), [updateCollections])

  const getAll = useCallback(() => collections, [collections])

  const get = useCallback(
    (id: Identifier) => collections.find((collection) => collection.id === id),
    [collections]
  )

  const setPreRequest = useCallback(
    (collectionId: Identifier, preRequest: PreRequest) => {
      const collection = get(collectionId)
      if (collection) {
        collection.preRequest = preRequest
        update(collection)
      }
    },
    [get, update]
  )

  const clearPreRequest = useCallback(
    (collectionId: Identifier) => {
      const collection = get(collectionId)
      if (collection) {
        delete collection.preRequest
        update(collection)
      }
    },
    [get, update]
  )

  const addRequestToCollection = useCallback(
    ({
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
    },
    [update]
  )

  const saveRequest = useCallback(
    ({ path, collectionId, request }: SaveRequest) => {
      const collection = get(collectionId)
      if (collection) {
        addRequestToCollection({ collection, request, path })
      }
    },
    [get, addRequestToCollection]
  )

  const move = useCallback(
    (id: Identifier, toBeforeId: Identifier) => {
      const newCollections = [...collections]
      const fromIndex = newCollections.findIndex((t) => t.id == id)
      const toIndex = newCollections.findIndex((t) => t.id == toBeforeId)
      const [removed] = newCollections.splice(fromIndex, 1)
      newCollections.splice(toIndex, 0, removed)
      updateCollections(newCollections)
      ipcRenderer?.send(COLLECTIONS.updateAll, newCollections)
    },
    [collections, ipcRenderer, updateCollections]
  )

  const getEnvironmentId = useCallback(
    (collectionId: Identifier) => {
      const collection = get(collectionId)
      return collection?.environmentId
    },
    [get]
  )

  const setEnvironmentId = useCallback(
    (collectionId: Identifier, environmentId?: Identifier) => {
      const collection = get(collectionId)
      if (!collection) {
        return
      }
      collection.environmentId = environmentId
      update(collection)
    },
    [get, update]
  )

  const select = useCallback(
    (collectionId: Identifier | null) => {
      if (collectionId === selectedCollection?.id) {
        return
      }
      if (collectionId === null) {
        setSelectedCollection(null)
        return
      }
      const collection = get(collectionId)
      setSelectedCollection(collection || null)
    },
    [selectedCollection, get]
  )

  const duplicateFolder = useCallback(
    (collectionId: Identifier, folderId: Identifier, path: PathItem[]) => {
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
    },
    [getAll, update]
  )

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  )
}
