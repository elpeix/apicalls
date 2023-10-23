import { useState } from 'react'

export function useEnvironments() {

  // TODO: use localStorage to persist environments
  // TODO: Create structure for environments

  const [environments, setEnvironments] = useState([])

  const add = (environment) => {
    const newEnvironments = [...environments, environment]
    setEnvironments(newEnvironments)
  }

  const remove = (id) => setEnvironments(environments.filter(environment => environment.id !== id))

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