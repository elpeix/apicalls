import React, { createContext, useState } from 'react'
import useTabs from '../hooks/useTabs'
import { useHistory } from '../hooks/useHistory'
import { useEnvironments } from '../hooks/useEnvironments'
import { useMenu } from '../hooks/useMenu'

export const AppContext = createContext()

export default function AppContextProvider({ children }) {

  const menu = useMenu()
  const tabs = useTabs([{ 
    type: 'history',
    id: '1',
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
    id: '2',
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
    id: '3',
    active: false,
    request: {}
  }])
  const [collections, setCollections] = useState([{
    id: '1',
    name: 'Collection 1',
    requests: [
      {
        id: '1',
        name: 'Request 1',
        url: 'https://www.google.com',
        method: 'GET',
        headers: [
          { name: 'Content-Type', value: 'application/json', enabled: true },
          { name: 'Accept', value: 'application/json', enabled: true }
        ],
        params: [
          { name: 'userId', value: '1', enabled: true },
          { name: 'id', value: '1', enabled: true }
        ]
      }
    ]
  }])
  const environments = useEnvironments()
  const history = useHistory()

  const contextValue = {
    menu,
    tabs,
    collections: {
      items: collections,
      set: setCollections
    },
    environments,
    history
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
