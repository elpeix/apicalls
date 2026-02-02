import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ACTIONS } from '../../../../../lib/ipcChannels'
import { useRequestActions, useRequestMeta, ResponseContext } from '../../../context/RequestContext'
import { AppContext } from '../../../context/AppContext'
import { GroupHandle, PanelHandle } from 'simple-panels'

export function useRequestShortcuts() {
  const { fetch } = useRequestActions()
  const { isActive, save, setOpenSaveAs } = useRequestMeta()
  const { fetching } = useContext(ResponseContext)
  const { application } = useContext(AppContext)

  const requestGroupRef = useRef<GroupHandle>(null)
  const requestPanelRef = useRef<PanelHandle>(null)
  const consolePanelRef = useRef<PanelHandle>(null)

  const [consoleCollapsed, setConsoleCollapsed] = useState(true)

  // Send Request shortcut
  useEffect(() => {
    if (!isActive || fetching) return
    const ipcRenderer = window.electron?.ipcRenderer
    const handleSendRequest = () => {
      if (application.dialogIsOpen) return
      return fetch()
    }
    ipcRenderer?.on(ACTIONS.sendRequest, handleSendRequest)
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.sendRequest)
    }
  }, [isActive, fetch, fetching, application.dialogIsOpen])

  // Save Request shortcut
  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    const handleSave = () => {
      if (application.dialogIsOpen) return
      save()
    }
    ipcRenderer?.on(ACTIONS.saveRequest, handleSave)
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.saveRequest)
    }
  }, [isActive, save, application.dialogIsOpen])

  // Save As shortcut
  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    const handleSaveAs = () => {
      if (application.dialogIsOpen) return
      if (setOpenSaveAs) {
        setOpenSaveAs(true)
      }
    }
    ipcRenderer?.on(ACTIONS.saveAsRequest, handleSaveAs)
    return () => {
      ipcRenderer?.removeListener(ACTIONS.saveAsRequest, handleSaveAs)
    }
  }, [isActive, setOpenSaveAs, application.dialogIsOpen])

  const toggleRequestPanel = useCallback(() => {
    if (!requestPanelRef.current) return
    if (!requestGroupRef.current) return

    const states = requestGroupRef.current.getCollapsedStates()
    if (states && states[0]) {
      requestPanelRef.current.expand()
    } else {
      requestPanelRef.current.collapse()
    }
  }, [])

  // Toggle Request Panel shortcut
  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    ipcRenderer?.on(ACTIONS.toggleRequestPanel, toggleRequestPanel)
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.toggleRequestPanel)
    }
  }, [isActive, toggleRequestPanel])

  // Toggle Console shortcut
  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    const handleToggleConsole = () => {
      if (consoleCollapsed) consolePanelRef.current?.expand()
      else consolePanelRef.current?.collapse()
    }
    ipcRenderer?.on(ACTIONS.toggleConsole, handleToggleConsole)
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.toggleConsole)
    }
  }, [isActive, consoleCollapsed])

  return {
    requestGroupRef,
    requestPanelRef,
    toggleRequestPanel,
    consolePanelRef,
    consoleCollapsed,
    setConsoleCollapsed
  }
}
