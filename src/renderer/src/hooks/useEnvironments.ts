import { useState } from 'react'
import { ENVIRONMENTS } from '../../../lib/ipcChannels'

export function useEnvironments(): EnvironmentsHookType {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const ipcRenderer = window.electron.ipcRenderer

  const create = () => {
    const newEnvironment = {
      id: new Date().getTime(),
      name: '',
      active: false,
      variables: []
    }
    add(newEnvironment)
    return newEnvironment
  }
  const add = (environment: Environment) => {
    setEnvironments([...environments, environment])
    ipcRenderer.send(ENVIRONMENTS.create, environment)
  }

  const remove = (id: Identifier) => {
    setEnvironments(environments.filter((environment) => environment.id !== id))
    ipcRenderer.send(ENVIRONMENTS.remove, id)
  }

  const update = (environment: Environment) => {
    setEnvironments(environments.map((env) => (env.id === environment.id ? environment : env)))
    ipcRenderer.send(ENVIRONMENTS.update, environment)
  }

  const updateAll = (environments: Environment[]) => {
    setEnvironments(environments)
    ipcRenderer.send(ENVIRONMENTS.updateAll, environments)
  }

  const duplicate = (id: Identifier) => {
    const environment = get(id)
    if (!environment) return
    const newEnvironment = {
      ...environment,
      id: new Date().getTime(),
      name: `${environment.name} Copy`
    }
    add(newEnvironment)
  }

  const clear = () => setEnvironments([])
  const getAll = () => environments
  const get = (id: Identifier) => environments.find((environment) => environment.id === id)
  const getActive = () => environments.find((environment) => environment.active)
  const active = (id: Identifier) =>
    updateAll(
      environments.map((environment) => {
        environment.active = environment.id === id
        return environment
      })
    )
  const deactive = () =>
    updateAll(
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
    setEnvironments,
    getAll,
    create,
    add,
    update,
    remove,
    duplicate,
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
