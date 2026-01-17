import { useContext, useEffect, useRef, useState } from 'react'
import { ACTIONS } from '../../../../../lib/ipcChannels'
import { RequestContext } from '../../../context/RequestContext'
import { AppContext } from '../../../context/AppContext'
import { PanelHandle } from 'simple-panels'

export function useRequestShortcuts() {
  const { isActive, request, fetching, save, setOpenSaveAs } = useContext(RequestContext)
  const { application } = useContext(AppContext)

  const requestPanelRef = useRef<PanelHandle>(null)
  const [requestPanelCollapsed, setRequestPanelCollapsed] = useState(false)

  const consolePanelRef = useRef<PanelHandle>(null)
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)

  // Send Request shortcut
  useEffect(() => {
    if (!isActive || fetching) return
    const ipcRenderer = window.electron?.ipcRenderer
    const handleSendRequest = () => {
      if (application.dialogIsOpen) return
      return request?.fetch()
    }
    ipcRenderer?.on(ACTIONS.sendRequest, handleSendRequest)
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.sendRequest)
    }
  }, [isActive, request, fetching, application.dialogIsOpen])

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

  // Toggle Request Panel shortcut
  useEffect(() => {
    if (!isActive) return
    const ipcRenderer = window.electron?.ipcRenderer
    const handleToggleRequestPanel = () => {
      if (!requestPanelRef.current) return
      if (requestPanelCollapsed) requestPanelRef.current.expand()
      else requestPanelRef.current.collapse()
    }
    ipcRenderer?.on(ACTIONS.toggleRequestPanel, handleToggleRequestPanel)
    return () => {
      ipcRenderer?.removeAllListeners(ACTIONS.toggleRequestPanel)
    }
  }, [isActive, requestPanelCollapsed])

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
    requestPanelRef,
    requestPanelCollapsed,
    setRequestPanelCollapsed,
    consolePanelRef,
    consoleCollapsed,
    setConsoleCollapsed
  }
}
