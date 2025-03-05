import React, { createContext, useEffect, useState } from 'react'
import useTabs from '../hooks/useTabs'
import { useHistory } from '../hooks/useHistory'
import { useEnvironments } from '../hooks/useEnvironments'
import { useMenu } from '../hooks/useMenu'
import { useCollections } from '../hooks/useCollections'
import { COLLECTIONS, COOKIES, ENVIRONMENTS, TABS } from '../../../lib/ipcChannels'
import { useCookies } from '../hooks/useCookies'
import { useSettings as useAppSettings } from '../hooks/useSettings'
import Dialog from '../components/base/dialog/Dialog'
import Prompt from '../components/base/PopupBoxes/Prompt'
import Confirm from '../components/base/PopupBoxes/Confirm'
import { defaultSettings } from '../../../lib/defaults'
import Alert from '../components/base/PopupBoxes/Alert'

export const AppContext = createContext<{
  application: ApplicationType
  menu: MenuHookType | null
  tabs: TabsHookType | null
  collections: CollectionsHookType | null
  environments: EnvironmentsHookType | null
  history: HistoryHookType | null
  cookies: CookiesHookType | null
  appSettings: AppSettingsHookType | null
}>({
  application: {} as ApplicationType,
  menu: null,
  tabs: null,
  collections: null,
  environments: null,
  history: null,
  cookies: null,
  appSettings: null
})

export default function AppContextProvider({ children }: { children: React.ReactNode }) {
  const appSettings = useAppSettings()
  const menu = useMenu(appSettings.settings || defaultSettings)
  const collections = useCollections()
  const tabs = useTabs([], collections)
  const environments = useEnvironments()
  const history = useHistory()
  const cookies = useCookies()

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(ENVIRONMENTS.get)
    ipcRenderer?.send(COLLECTIONS.get)
    ipcRenderer?.send(TABS.load)
    ipcRenderer?.send(COOKIES.get)

    ipcRenderer?.on(ENVIRONMENTS.updated, (_: unknown, environmentList: Environment[]) => {
      environments?.setEnvironments(environmentList)
    })

    ipcRenderer?.on(COLLECTIONS.updated, (_: unknown, collectionList: Collection[]) => {
      collections?.setCollections(collectionList)
    })

    ipcRenderer?.on(TABS.loadSuccess, (_: unknown, tabList: RequestTab[]) => {
      tabs?.initTabs(tabList)
    })

    ipcRenderer?.on(COOKIES.loaded, (_: unknown, cookieList: Cookie[]) => {
      cookies?.set(cookieList)
    })

    return () => {
      ipcRenderer?.removeAllListeners(ENVIRONMENTS.updated)
      ipcRenderer?.removeAllListeners(COLLECTIONS.updated)
      ipcRenderer?.removeAllListeners(TABS.loadSuccess)
      ipcRenderer?.removeAllListeners(COOKIES.loaded)
    }
  }, [])

  const [dialogProps, setDialogProps] = useState<DialogType | null>(null)

  const showDialog = (dialogProps: DialogType) => {
    setDialogProps(dialogProps)
  }

  const hideDialog = () => {
    dialogProps?.onClose?.()
    setDialogProps(null)
  }

  const showAlert = (alertProps: AlertType) => {
    showDialog({
      children: (
        <Alert
          message={alertProps.message}
          buttonName={alertProps.buttonName}
          buttonColor={alertProps.buttonColor}
          onClose={() => {
            hideAlert()
            alertProps.onClose?.()
          }}
        />
      )
    })
  }

  const hideAlert = () => {
    hideDialog()
  }

  const showConfirm = (confirmProps: ConfirmType) => {
    showDialog({
      children: (
        <Confirm
          message={confirmProps.message}
          confirmName={confirmProps.confirmName}
          confirmColor={confirmProps.confirmColor}
          onConfirm={confirmProps.onConfirm}
          onCancel={confirmProps.onCancel}
        />
      )
    })
  }

  const hideConfirm = () => {
    hideDialog()
  }

  const showPrompt = (promptProps: PromptType) => {
    showDialog({
      children: (
        <Prompt
          message={promptProps.message}
          placeholder={promptProps.placeholder}
          confirmName={promptProps.confirmName}
          onConfirm={promptProps.onConfirm}
          onCancel={promptProps.onCancel}
        />
      )
    })
  }

  const hidePrompt = () => {
    hideDialog()
  }

  const dialogIsOpen = !!dialogProps

  const contextValue = {
    application: {
      showDialog,
      hideDialog,
      showAlert,
      hideAlert,
      showPrompt,
      hidePrompt,
      showConfirm,
      hideConfirm,
      dialogIsOpen
    },
    menu,
    tabs,
    collections,
    environments,
    history,
    cookies,
    appSettings
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {dialogProps && (
        <Dialog
          className={dialogProps.className}
          onClose={hideDialog}
          preventKeyClose={dialogProps.preventKeyClose}
          position={dialogProps.position}
          fullWidth={dialogProps.fullWidth}
        >
          {dialogProps.children}
        </Dialog>
      )}
    </AppContext.Provider>
  )
}
