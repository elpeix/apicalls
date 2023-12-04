import React, { createContext } from 'react'
import useTabs from '../hooks/useTabs'
import { useHistory } from '../hooks/useHistory'
import { useEnvironments } from '../hooks/useEnvironments'
import { useMenu } from '../hooks/useMenu'
import { useCollections } from '../hooks/useCollections'

export const AppContext = createContext<{
  menu: MenuHook | null,
  tabs: any,
  collections: CollectionsHook | null,
  environments: EnvironmentsHook | null,
  history: any,
}>({
  menu: null,
  tabs: {},
  collections: null,
  environments: null,
  history: {}
})

export default function AppContextProvider({ children }: { children: React.ReactNode }) {

  const menu = useMenu()
  const tabs = useTabs([{ 
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
  },{
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
  }, {
    type: 'draft',
    id: '000003',
    active: false,
    request: {
      url: '',
      method: { value: 'GET', label: 'GET', body: false },
      headers: [],
      params: []
    }
  }])
  const collections = useCollections()
  const environments = useEnvironments()
  const history = useHistory()

  const contextValue = {
    menu,
    tabs,
    collections,
    environments,
    history
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
