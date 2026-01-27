import { useCallback, useMemo, useState } from 'react'
import { ENVIRONMENTS } from '../../../lib/ipcChannels'

export function useEnvironments(): EnvironmentsHookType {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const ipcRenderer = window.electron?.ipcRenderer

  const add = useCallback(
    (environment: Environment) => {
      setEnvironments((prev) => [...prev, environment])
      ipcRenderer?.send(ENVIRONMENTS.create, environment)
    },
    [ipcRenderer]
  )

  const create = useCallback(
    (name?: string) => {
      const newEnvironment = {
        id: crypto.randomUUID(),
        name: name || '',
        active: false,
        variables: []
      }
      add(newEnvironment)
      return newEnvironment
    },
    [add]
  )

  const updateAll = useCallback(
    (environments: Environment[]) => {
      setEnvironments(environments)
      ipcRenderer?.send(ENVIRONMENTS.updateAll, environments)
    },
    [ipcRenderer]
  )

  const remove = useCallback(
    (id: Identifier) => {
      setEnvironments((prev) => prev.filter((environment) => environment.id !== id))
      ipcRenderer?.send(ENVIRONMENTS.remove, id)
    },
    [ipcRenderer]
  )

  const update = useCallback(
    (environment: Environment) => {
      setEnvironments((prev) => prev.map((env) => (env.id === environment.id ? environment : env)))
      ipcRenderer?.send(ENVIRONMENTS.update, environment)
    },
    [ipcRenderer]
  )

  const get = useCallback(
    (id: Identifier) => environments.find((environment) => environment.id === id),
    [environments]
  )

  const duplicate = useCallback(
    (id: Identifier) => {
      const environment = environments.find((environment) => environment.id === id)
      if (!environment) return
      const newEnvironment = {
        ...environment,
        id: crypto.randomUUID(),
        name: `${environment.name} Copy`
      }
      add(newEnvironment)
    },
    [environments, add]
  )

  const clear = useCallback(() => setEnvironments([]), [])
  const getAll = useCallback(() => environments, [environments])
  const getActive = useCallback(
    () => environments.find((environment) => environment.active),
    [environments]
  )

  const active = useCallback(
    (id: Identifier) =>
      updateAll(
        environments.map((environment) => {
          environment.active = environment.id === id
          return environment
        })
      ),
    [environments, updateAll]
  )

  const deactive = useCallback(
    () =>
      updateAll(
        environments.map((environment) => {
          environment.active = false
          return environment
        })
      ),
    [environments, updateAll]
  )

  const variableIsDefined = useCallback(
    (id: Identifier, name: string): boolean => {
      const environment = environments.find((environment) => environment.id === id)
      if (!environment) return false
      return environment.variables.some((variable) => variable.name === name)
    },
    [environments]
  )

  const replaceVariables = useCallback(
    (id: Identifier, value: string) => {
      const environment = environments.find((environment) => environment.id === id)
      if (!environment) return value
      environment.variables.forEach((variable) => {
        value = value.replaceAll(`{{${variable.name}}}`, variable.value)
      })
      return value
    },
    [environments]
  )

  const getVariableValue = useCallback(
    (id: Identifier, name: string) => {
      const environment = environments.find((environment) => environment.id === id)
      if (!environment) return ''
      const variable = environment.variables.find((variable) => variable.name === name)
      if (!variable) return ''
      return variable.value
    },
    [environments]
  )

  const getVariables = useCallback(
    (id: Identifier = 0) => {
      let environment: Environment | undefined
      if (id === 0) {
        environment = environments.find((environment) => environment.active)
      } else {
        environment = environments.find((environment) => environment.id === id)
      }
      if (!environment) return []
      return environment.variables
    },
    [environments]
  )

  const move = useCallback(
    (id: Identifier, toBeforeId: Identifier) => {
      const newEnvs = [...environments]
      const fromIndex = newEnvs.findIndex((t) => t.id == id)
      const toIndex = newEnvs.findIndex((t) => t.id == toBeforeId)
      const [removed] = newEnvs.splice(fromIndex, 1)
      newEnvs.splice(toIndex, 0, removed)
      updateAll(newEnvs)
    },
    [environments, updateAll]
  )

  const hasItems = useCallback(() => environments.length > 0, [environments])

  return useMemo(
    () => ({
      setEnvironments,
      getAll,
      create,
      add,
      update,
      remove,
      duplicate,
      clear,
      move,
      get,
      getActive,
      active,
      deactive,
      variableIsDefined,
      replaceVariables,
      getVariableValue,
      getVariables,
      hasItems
    }),
    [
      getAll,
      create,
      add,
      update,
      remove,
      duplicate,
      clear,
      move,
      get,
      getActive,
      active,
      deactive,
      variableIsDefined,
      replaceVariables,
      getVariableValue,
      getVariables,
      hasItems
    ]
  )
}
