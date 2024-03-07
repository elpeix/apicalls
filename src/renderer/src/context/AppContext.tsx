import React, { createContext, useEffect } from 'react'
import useTabs from '../hooks/useTabs'
import { useHistory } from '../hooks/useHistory'
import { useEnvironments } from '../hooks/useEnvironments'
import { useMenu } from '../hooks/useMenu'
import { useCollections } from '../hooks/useCollections'
import {
  COLLECTIONS_UPDATED,
  ENVIRONMENTS_UPDATED,
  GET_COLLECTIONS,
  GET_ENVIRONMENTS
} from '../../../lib/ipcChannels'
import { useConsole } from '../hooks/useConsole'

export const AppContext = createContext<{
  menu: MenuHook | null
  tabs: TabsHook | null
  collections: CollectionsHook | null
  environments: EnvironmentsHook | null
  history: HistoryHook | null
  requestConsole: ConsoleHook | null
}>({
  menu: null,
  tabs: null,
  collections: null,
  environments: null,
  history: null,
  requestConsole: null
})

export default function AppContextProvider({ children }: { children: React.ReactNode }) {
  const menu = useMenu()
  const tabs = useTabs([
    {
      type: 'history',
      id: '000001',
      active: true,
      date: '2020-01-01T00:00:00.000Z',
      request: {
        method: { value: 'GET', label: 'GET', body: false },
        url: 'https://jsonplaceholder.typicode.com/todos/1',
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
      type: 'collection',
      name: 'Get Todos',
      id: '000002',
      active: false,
      request: {
        method: { value: 'GET', label: 'GET', body: false },
        url: 'https://jsonplaceholder.typicode.com/todos/',
        headers: [
          { name: 'Content-Type', value: 'application/json', enabled: true },
          { name: 'Accept', value: 'application/json', enabled: true },
          { name: 'x-app-id', value: '{{appId}}', enabled: true }
        ],
        params: []
      }
    },
    {
      type: 'draft',
      id: '000003',
      active: false,
      request: {
        url: '',
        method: { value: 'GET', label: 'GET', body: false },
        headers: [],
        params: []
      }
    }
  ])
  const collections = useCollections()
  const environments = useEnvironments()
  const history = useHistory()
  const requestConsole = useConsole()

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer

    ipcRenderer.send(GET_ENVIRONMENTS)
    ipcRenderer.on(ENVIRONMENTS_UPDATED, (_: any, environmentList: Environment[]) => {
      environments?.setEnvironments(environmentList)
    })

    ipcRenderer.send(GET_COLLECTIONS)
    ipcRenderer.on(COLLECTIONS_UPDATED, (_: any, collectionList: Collection[]) => {
      collections?.setCollections(collectionList)
    })

    return () => {
      ipcRenderer.removeAllListeners(ENVIRONMENTS_UPDATED)
      ipcRenderer.removeAllListeners(COLLECTIONS_UPDATED)
    }
  }, [])

  const contextValue = {
    menu,
    tabs,
    collections,
    environments,
    history,
    requestConsole
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}
