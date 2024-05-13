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
  GET_ENVIRONMENTS,
  TABS_LOAD,
  TABS_LOAD_SUCCESS
} from '../../../lib/ipcChannels'

export const AppContext = createContext<{
  menu: MenuHookType | null
  tabs: TabsHookType | null
  collections: CollectionsHookType | null
  environments: EnvironmentsHookType | null
  history: HistoryHookType | null
}>({
  menu: null,
  tabs: null,
  collections: null,
  environments: null,
  history: null
})

export default function AppContextProvider({ children }: { children: React.ReactNode }) {
  const menu = useMenu()
  const tabs = useTabs([])
  const collections = useCollections()
  const environments = useEnvironments()
  const history = useHistory()

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send(GET_ENVIRONMENTS)
    ipcRenderer.send(GET_COLLECTIONS)
    ipcRenderer.send(TABS_LOAD)
    ipcRenderer.on(ENVIRONMENTS_UPDATED, (_: unknown, environmentList: Environment[]) => {
      environments?.setEnvironments(environmentList)
    })

    ipcRenderer.on(COLLECTIONS_UPDATED, (_: unknown, collectionList: Collection[]) => {
      collections?.setCollections(collectionList)
    })

    ipcRenderer.on(TABS_LOAD_SUCCESS, (_: unknown, tabList: RequestTab[]) => {
      tabs?.setTabs(tabList)
    })

    return () => {
      ipcRenderer.removeAllListeners(ENVIRONMENTS_UPDATED)
      ipcRenderer.removeAllListeners(COLLECTIONS_UPDATED)
      ipcRenderer.removeAllListeners(TABS_LOAD_SUCCESS)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = {
    menu,
    tabs,
    collections,
    environments,
    history
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}
