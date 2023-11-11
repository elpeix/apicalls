import { useState } from 'react'

export function useCollections() {

  const [collections, setCollections] = useState([
    {
      id: '1',
      name: 'Collection 1',
      elements: [
        {
          type: 'folder',
          name: 'Main folder',
          elements: [
            {
              id: '1',
              name: 'Request 1',
              request: {
                url: 'http://{{baseUrl}}/',
                method: { value: 'GET', label: 'GET', body: false },
                headers: [
                  { name: 'Content-Type', value: 'application/json', enabled: true },
                  { name: 'Accept', value: 'application/json', enabled: true }
                ],
                params: [
                  { name: 'userId', value: '1', enabled: true },
                  { name: 'id', value: '1', enabled: true }
                ]
              }
            },
            {
              type: 'folder',
              name: 'Other folder',
              items: []
            }
          ]
        }
      ]
    }
  ])

  const create = () => {
    const newCollection = {
      id: new Date().getTime(),
      name: '',
      requests: []
    }
    setCollections([...collections, newCollection])
    return newCollection
  }

  const add = collection => setCollections([...collections, collection])
  const remove = id => setCollections(collections.filter(collection => collection.id !== id))
  const update = collection => setCollections(collections.map(coll => coll.id === collection.id ? collection : coll))
  const clear = () => setCollections([])
  const getAll = () => collections
  const get = id => collections.find(collection => collection.id === id)

  return {
    create,
    add,
    remove,
    update,
    clear,
    getAll,
    get
  }
}