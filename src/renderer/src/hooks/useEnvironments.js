import { useState } from 'react'

export function useEnvironments() {

  // TODO: use localStorage to persist environments

  const [environments, setEnvironments] = useState([{
    id: new Date().getTime(),
    name: 'Development',
    variables: [
      { name: 'baseUrl', value: 'http://localhost:3000' },
      { name: 'appId', value: '1234567890' },
      { name: 'appKey', value: '1234567890' }
    ]
  }])

  const add = environment => setEnvironments([...environments, environment])
  const remove = id => setEnvironments(environments.filter(environment => environment.id !== id))
  const clear = () => setEnvironments([])
  const getAll = () => environments
  const get = id => environments.find(environment => environment.id === id)

  return {
    getAll,
    add,
    remove,
    clear,
    get
  }

}