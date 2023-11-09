import { useState } from 'react'

export function useCollections() {

  const [collections, setCollections] = useState([{
    id: '1',
    name: 'Collection 1',
    requests: [
      {
        id: '1',
        name: 'Request 1',
        url: 'https://www.google.com',
        method: 'GET',
        headers: [
          { name: 'Content-Type', value: 'application/json', enabled: true },
          { name: 'Accept', value: 'application/json', enabled: true }
        ],
        params: [
          { name: 'userId', value: '1', enabled: true },
          { name: 'id', value: '1', enabled: true }
        ]
      }
    ]
  }])

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