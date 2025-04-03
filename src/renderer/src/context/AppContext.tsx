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
import ConfirmYesNo from '../components/base/PopupBoxes/ConfirmYesNo'

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

  const showConfirm = (props: ConfirmType) => {
    showDialog({
      children: <Confirm {...props} />
    })
  }

  const showYesNo = (props: YesNoType) => {
    showDialog({
      children: <ConfirmYesNo {...props} />
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

  const notify = ({ message }: NotifcationTtype) => {
    const settings = appSettings.settings
    if (!(settings?.showNotification ?? true)) {
      return
    }
    const notification = new window.Notification('API Calls', {
      body: message
    })
    notification.onclick = () => {
      window.focus()
    }
  }

  const revealRequest = (tab: RequestTab) => {
    if (tab.collectionId) {
      collections?.select(tab.collectionId)
      menu?.selectAndExpand('collection')
      tabs?.highlightCollectionRequest(tab)
    }
  }

  const closeTab = (tab: RequestTab) => {
    if (tab.saved || avoidCloseConfirm()) {
      tabs?.removeTab(tab.id, true)
      return
    }
    showYesNo({
      message: 'Do you want to save changes before closing the tab?',
      noName: 'Close without save',
      noColor: 'danger',
      yesName: 'Save',
      onYes: () => {
        tabs?.saveTab(tab.id)
        tabs?.removeTab(tab.id, true)
        hideDialog()
      },
      onNo: () => {
        tabs?.removeTab(tab.id, true)
        hideDialog()
      },
      onCancel: hideDialog
    })
  }

  const confirmCloseMessage = 'There are unsaved tabs. Do you still want to close?'
  const closeAllTabs = () => {
    if (avoidCloseConfirm()) {
      tabs.closeAllTabs(true)
      return
    }
    if (tabs?.getTabs().some((tab) => !tab.saved)) {
      showConfirm({
        message: confirmCloseMessage,
        confirmName: 'Close tabs',
        onConfirm: () => {
          tabs.closeAllTabs(true)
          hideDialog()
        },
        onCancel: hideDialog
      })
      return
    }
    tabs.closeAllTabs()
  }

  const closeOtherTabs = (tab: RequestTab) => {
    if (avoidCloseConfirm()) {
      tabs.closeOtherTabs(tab.id, true)
      return
    }
    const tabsToClose = tabs?.getTabs().filter((t) => t.id !== tab.id)
    if (tabsToClose.some((tab) => !tab.saved)) {
      showConfirm({
        message: confirmCloseMessage,
        confirmName: 'Close tabs',
        onConfirm: () => {
          tabs.closeOtherTabs(tab.id, true)
          hideDialog()
        },
        onCancel: hideDialog
      })
      return
    }
    tabs.closeOtherTabs(tab.id)
  }

  const avoidCloseConfirm = () => !(appSettings.settings?.confirmCloseUnsavedTab ?? true)

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
      dialogIsOpen,
      notify,
      tabActions: {
        revealRequest,
        closeTab,
        closeAllTabs,
        closeOtherTabs
      }
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
