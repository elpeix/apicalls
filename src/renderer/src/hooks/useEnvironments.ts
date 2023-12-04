import { useState } from 'react'

export function useEnvironments(): EnvironmentsHook {
  // TODO: use localStorage to persist environments

  const [environments, setEnvironments] = useState<Environment[]>([
    {
      id: new Date().getTime(),
      name: 'Development',
      active: true,
      variables: [
        { name: 'baseUrl', value: 'http://localhost:3000' },
        { name: 'appId', value: '1234567890' },
        { name: 'appKey', value: 'abcdef' }
      ]
    }
  ])

  const create = () => {
    const newEnvironment = {
      id: new Date().getTime(),
      name: '',
      active: false,
      variables: []
    }
    setEnvironments([...environments, newEnvironment])
    return newEnvironment
  }
  const add = (environment: Environment) => setEnvironments([...environments, environment])
  const remove = (id: number | string) =>
    setEnvironments(environments.filter((environment) => environment.id !== id))
  const update = (environment: Environment) =>
    setEnvironments(environments.map((env) => (env.id === environment.id ? environment : env)))
  const clear = () => setEnvironments([])
  const getAll = () => environments
  const get = (id: number | string) => environments.find((environment) => environment.id === id)
  const getActive = () => environments.find((environment) => environment.active)
  const active = (id: number | string) =>
    setEnvironments(
      environments.map((environment) => {
        environment.active = environment.id === id
        return environment
      })
    )
  const deactive = () =>
    setEnvironments(
      environments.map((environment) => {
        environment.active = false
        return environment
      })
    )
  const variableIsDefined = (name: string): boolean => {
    const activeEnvironment = getActive()
    if (!activeEnvironment) return false
    return activeEnvironment.variables.some((variable) => variable.name === name)
  }
  const replaceVariables = (value: string) => {
    const activeEnvironment = getActive()
    if (!activeEnvironment) return value
    activeEnvironment.variables.forEach((variable) => {
      value = value.replace(`{{${variable.name}}}`, variable.value)
    })
    return value
  }
  const getVariableValue = (name: string) => {
    const activeEnvironment = getActive()
    if (!activeEnvironment) return ''
    const variable = activeEnvironment.variables.find((variable) => variable.name === name)
    if (!variable) return ''
    return variable.value
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
    replaceVariables,
    getVariableValue
  }
}
