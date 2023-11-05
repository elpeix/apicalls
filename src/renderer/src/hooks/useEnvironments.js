import { useState } from 'react'

export function useEnvironments() {

  // TODO: use localStorage to persist environments

  const [environments, setEnvironments] = useState([{
    id: new Date().getTime(),
    name: 'Development',
    active: true,
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
  const getActive = () => environments.find(environment => environment.active)
  const active = id => setEnvironments(environments.map(environment => {
    environment.active = environment.id === id
    return environment
  }))
  const deactive = () => setEnvironments(environments.map(environment => {
    environment.active = false
    return environment
  }))
  const variableIsDefined = (name) => {
    const activeEnvironment = getActive()
    if (!activeEnvironment) return false
    return activeEnvironment.variables.find(variable => variable.name === name)
  }
  const replaceVariables = (value) => {
    const activeEnvironment = getActive()
    if (!activeEnvironment) return value
    activeEnvironment.variables.forEach(variable => {
      value = value.replace(`{{${variable.name}}}`, variable.value)
    })
    return value
  }

  return {
    getAll,
    create,
    add,
    update,
    remove,
    clear,
    get,
    getActive,
    active,
    deactive,
    variableIsDefined,
    replaceVariables
  }

}