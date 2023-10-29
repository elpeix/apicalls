import { useState } from 'react'

export function useEnvironments() {

  // TODO: use localStorage to persist environments

  const [environments, setEnvironments] = useState([{
    id: new Date().getTime(),
    name: 'Development',
    variables: [
      { name: 'baseUrl', value: 'http://localhost:3000' },
      { name: 'appId', value: '1234567890' },
      { name: 'appKey', value: 'abcdef' }
    ]
  }])

  const create = () => {
    const newEnvironment = {
      id: new Date().getTime(),
      name: '',
      variables: []
    }
    setEnvironments([...environments, newEnvironment])
    return newEnvironment
  }
  const add = environment => setEnvironments([...environments, environment])
  const remove = id => setEnvironments(environments.filter(environment => environment.id !== id))
  const update = environment => setEnvironments(environments.map(env => env.id === environment.id ? environment : env))
  const clear = () => setEnvironments([])
  const getAll = () => environments
  const get = id => environments.find(environment => environment.id === id)

  return {
    getAll,
    create,
    add,
    update,
    remove,
    clear,
    get
  }

}