import React, { createContext, useEffect } from 'react'
import useTabs from '../hooks/useTabs'
import { useHistory } from '../hooks/useHistory'
import { useEnvironments } from '../hooks/useEnvironments'
import { useMenu } from '../hooks/useMenu'
import { useCollections } from '../hooks/useCollections'
import { COLLECTIONS, ENVIRONMENTS, TABS } from '../../../lib/ipcChannels'
import { useCookies } from '../hooks/useCookies'
import { useSettigns as useAppSettings } from '../hooks/useSettings'

export const AppContext = createContext<{
  menu: MenuHookType | null
  tabs: TabsHookType | null
  collections: CollectionsHookType | null
  environments: EnvironmentsHookType | null
  history: HistoryHookType | null
  cookies: CookiesHookType | null
  appSettings: AppSettingsHookType | null
}>({
  menu: null,
  tabs: null,
  collections: null,
  environments: null,
  history: null,
  cookies: null,
  appSettings: null
})

export default function AppContextProvider({ children }: { children: React.ReactNode }) {
  const menu = useMenu()
  const tabs = useTabs([])
  const collections = useCollections()
  const environments = useEnvironments()
  const history = useHistory()
  const cookies = useCookies()
  const appSettings = useAppSettings()

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send(ENVIRONMENTS.get)
    ipcRenderer.send(COLLECTIONS.get)
    ipcRenderer.send(TABS.load)

    ipcRenderer.on(ENVIRONMENTS.updated, (_: unknown, environmentList: Environment[]) => {
      environments?.setEnvironments(environmentList)
    })

    ipcRenderer.on(COLLECTIONS.updated, (_: unknown, collectionList: Collection[]) => {
      collections?.setCollections(collectionList)
    })

    ipcRenderer.on(TABS.loadSuccess, (_: unknown, tabList: RequestTab[]) => {
      tabs?.setTabs(tabList)
    })

    return () => {
      ipcRenderer.removeAllListeners(ENVIRONMENTS.updated)
      ipcRenderer.removeAllListeners(COLLECTIONS.updated)
      ipcRenderer.removeAllListeners(TABS.loadSuccess)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = {
    menu,
    tabs,
    collections,
    environments,
    history,
    cookies,
    appSettings
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}
