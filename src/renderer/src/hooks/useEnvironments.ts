import { useState } from 'react'
import {
  CREATE_ENVIRONMENT,
  REMOVE_ENVIRONMENT,
  UPDATE_ENVIRONMENT
} from '../../../lib/ipcChannels'

export function useEnvironments(): EnvironmentsHook {
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
    ipcRenderer.send(CREATE_ENVIRONMENT, environment)
  }

  const remove = (id: Identifier) => {
    setEnvironments(environments.filter((environment) => environment.id !== id))
    ipcRenderer.send(REMOVE_ENVIRONMENT, id)
  }

  const update = (environment: Environment) => {
    setEnvironments(environments.map((env) => (env.id === environment.id ? environment : env)))
    ipcRenderer.send(UPDATE_ENVIRONMENT, environment)
  }

  const clear = () => setEnvironments([])
  const getAll = () => environments
  const get = (id: Identifier) => environments.find((environment) => environment.id === id)
  const getActive = () => environments.find((environment) => environment.active)
  const active = (id: Identifier) =>
    setEnvironments(
      environments.map((environment) => {
        environment.active = environment.id === id
        ipcRenderer.send(UPDATE_ENVIRONMENT, environment)
        return environment
      })
    )
  const deactive = () =>
    setEnvironments(
      environments.map((environment) => {
        environment.active = false
        ipcRenderer.send(UPDATE_ENVIRONMENT, environment)
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
