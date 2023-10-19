import React, { createContext, useState } from 'react'
import useTabs from '../hooks/useTabs'

export const AppContext = createContext()

export default function AppContextProvider({ children }) {

  const menu = [
    { id: 'collection', title: 'Collections' },
    { id: 'environment', title: 'Environments' },
    { id: 'history', title: 'History' },
    { spacer: true },
    { id: 'settings', title: 'Settings' }
  ]
  const [selectedMenu, setSelected] = useState(menu[0])
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
        { name: 'Accept', value: 'application/json', enabled: true }
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
  const [environments, setEnvironments] = useState([])
  const [history, setHistory] = useState([{
    method: { value: 'GET', label: 'GET', body: false },
    url: 'https://jsonplaceholder.typicode.com/todos/2',
    headers: [
      { name: 'Content-Type', value: 'application/json', enabled: true },
      { name: 'Accept', value: 'application/json', enabled: true }
    ],
    params: [
      { name: 'userId', value: '1', enabled: true },
      { name: 'id', value: '1', enabled: true }
    ]
  }])

  const selectItem = id => {
    const item = menu.find(item => item.id === id)
    if (item) setSelected(item)
    else setSelected(null)
  }

  const contextValue = {
    menu: {
      items: menu,
      selected: selectedMenu,
      select: selectItem
    },
    tabs,
    collections: {
      items: collections,
      set: setCollections
    },
    environments: {
      items: environments,
      set: setEnvironments
    },
    history: {
      items: history,
      set: setHistory
    }
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
