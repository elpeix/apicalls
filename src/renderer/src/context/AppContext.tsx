import React, { createContext, useEffect, useState } from 'react'
import useTabs from '../hooks/useTabs'
import { useHistory } from '../hooks/useHistory'
import { useEnvironments } from '../hooks/useEnvironments'
import { useMenu } from '../hooks/useMenu'
import { useCollections } from '../hooks/useCollections'
import {
  COLLECTIONS,
  COOKIES,
  ENVIRONMENTS,
  AUTO_UPDATE,
  TABS,
  VERSION,
  WORKSPACES
} from '../../../lib/ipcChannels'
import { useCookies } from '../hooks/useCookies'
import { useSettings as useAppSettings } from '../hooks/useSettings'
import Dialog from '../components/base/dialog/Dialog'
import Prompt from '../components/base/PopupBoxes/Prompt'
import Confirm from '../components/base/PopupBoxes/Confirm'
import { defaultSettings } from '../../../lib/defaults'
import Alert from '../components/base/PopupBoxes/Alert'
import ConfirmYesNo from '../components/base/PopupBoxes/ConfirmYesNo'
import About from '../components/base/About/About'
import { useWorkspaces } from '../hooks/useWorkspaces'

export const AppContext = createContext<{
  application: ApplicationType
  workspaces: WorkspacesHookType | null
  menu: MenuHookType | null
  tabs: TabsHookType | null
  collections: CollectionsHookType | null
  environments: EnvironmentsHookType | null
  history: HistoryHookType | null
  cookies: CookiesHookType | null
  appSettings: AppSettingsHookType | null
}>({
  application: {} as ApplicationType,
  workspaces: null,
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
  const [appVersion, setAppVersion] = useState('')
  const workspaces = useWorkspaces()
  const menu = useMenu(appSettings.settings || defaultSettings)
  const collections = useCollections()
  const tabs = useTabs([], collections)
  const environments = useEnvironments()
  const history = useHistory()
  const cookies = useCookies()

  useEffect(() => {
    if (window.api.os.isMac) {
      window.document.body.classList.add('mac')
    }
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.send(ENVIRONMENTS.get)
    ipcRenderer?.send(COLLECTIONS.get)
    ipcRenderer?.send(TABS.load)
    ipcRenderer?.send(COOKIES.get)
    ipcRenderer?.send(VERSION.get)

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

    ipcRenderer?.on(VERSION.show, (_: unknown) => {
      showDialog({
        children: <About />
      })
    })

    ipcRenderer?.on(VERSION.getSuccess, (_: unknown, version: string) => {
      setAppVersion(version)
    })

    ipcRenderer?.on(WORKSPACES.error, (_: unknown, error: { message: string }) => {
      console.error('Error in Workspaces:', error.message)
      showAlert({
        message: error.message,
        buttonName: 'OK',
        buttonColor: 'danger',
        onClose: () => {}
      })
    })

    return () => {
      ipcRenderer?.removeAllListeners(ENVIRONMENTS.updated)
      ipcRenderer?.removeAllListeners(COLLECTIONS.updated)
      ipcRenderer?.removeAllListeners(TABS.loadSuccess)
      ipcRenderer?.removeAllListeners(COOKIES.loaded)
      ipcRenderer?.removeAllListeners(VERSION.get)
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

  const hideAlert = () => hideDialog()

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

  const hideConfirm = () => hideDialog()

  const showPrompt = (promptProps: PromptType) => {
    showDialog({
      children: (
        <Prompt
          message={promptProps.message}
          placeholder={promptProps.placeholder}
          value={promptProps.value}
          valueSelected={promptProps.valueSelected}
          confirmName={promptProps.confirmName}
          onConfirm={promptProps.onConfirm}
          onCancel={promptProps.onCancel}
        />
      )
    })
  }

  const hidePrompt = () => hideDialog()

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

  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer
    if (!ipcRenderer) {
      return
    }

    const handleAutoUpdateStatus = (_: unknown, payload: AutoUpdateStatusPayload) => {
      switch (payload.type) {
        case 'available': {
          const message = payload.initiatedByUser
            ? `Version ${payload.version} is available. Downloading now...`
            : `A new version (${payload.version}) is downloading in the background.`
          notify({ message })
          break
        }
        case 'downloaded': {
          showYesNo({
            message: `Version ${payload.version} is ready to install. Restart now?`,
            yesName: 'Restart now',
            noName: 'Later',
            onYes: () => {
              ipcRenderer.send(AUTO_UPDATE.install)
              hideDialog()
            },
            onNo: hideDialog,
            onCancel: hideDialog
          })
          break
        }
        case 'not-available': {
          if (payload.initiatedByUser) {
            notify({ message: 'You are already using the latest version.' })
          }
          break
        }
        case 'error': {
          if (payload.initiatedByUser) {
            notify({ message: `Update failed: ${payload.message}` })
          } else {
            console.error('Auto update error:', payload.message)
          }
          break
        }
        case 'not-supported': {
          notify({ message: 'Auto update is not available on this platform.' })
          break
        }
        default:
          break
      }
    }

    ipcRenderer.on(AUTO_UPDATE.status, handleAutoUpdateStatus)

    return () => {
      ipcRenderer.removeListener(AUTO_UPDATE.status, handleAutoUpdateStatus)
    }
  }, [])

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
      },
      version: appVersion
    },
    workspaces,
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
