import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COLLECTIONS, COOKIES, ENVIRONMENTS, TABS, WORKSPACES } from '../../../lib/ipcChannels'

export function useWorkspaces(): WorkspacesHookType {
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType | null>(null)
  const selectedWorkspaceRef = useRef<WorkspaceType | null>(null)
  const ipcRenderer = window.electron?.ipcRenderer

  // Keep ref in sync with state
  useEffect(() => {
    selectedWorkspaceRef.current = selectedWorkspace
  }, [selectedWorkspace])

  const reload = useCallback(() => {
    ipcRenderer?.send(WORKSPACES.getList)
    ipcRenderer?.send(WORKSPACES.getSelected)
  }, [ipcRenderer])

  useEffect(() => {
    reload()

    const handleList = (_: unknown, ws: WorkspaceType[]) => {
      setWorkspaces(ws)
    }

    const handleSelected = (_: unknown, ws: WorkspaceType) => {
      if (!ws) {
        console.warn('No workspace selected')
        return
      }

      const currentWorkspace = selectedWorkspaceRef.current
      const isSwitching = ws.id !== currentWorkspace?.id
      const hasChanged =
        isSwitching ||
        ws.name !== currentWorkspace?.name ||
        JSON.stringify(ws.requestHeaders) !== JSON.stringify(currentWorkspace?.requestHeaders)

      if (hasChanged) {
        setSelectedWorkspace(ws)

        setWorkspaces((prevWorkspaces) =>
          prevWorkspaces.map((w) => ({
            ...w,
            selected: w.id === ws.id
          }))
        )
      }

      if (isSwitching) {
        ipcRenderer?.send(WORKSPACES.getList)
        ipcRenderer?.send(ENVIRONMENTS.get)
        ipcRenderer?.send(COLLECTIONS.get)
        ipcRenderer?.send(TABS.load)
        ipcRenderer?.send(COOKIES.get)
      }
    }

    const handleReload = () => reload()

    ipcRenderer?.on(WORKSPACES.list, handleList)
    ipcRenderer?.on(WORKSPACES.selected, handleSelected)
    ipcRenderer?.on(WORKSPACES.created, handleReload)
    ipcRenderer?.on(WORKSPACES.updated, handleReload)
    ipcRenderer?.on(WORKSPACES.removed, handleReload)
    ipcRenderer?.on(WORKSPACES.duplicated, handleReload)

    return () => {
      ipcRenderer?.removeAllListeners(WORKSPACES.list)
      ipcRenderer?.removeAllListeners(WORKSPACES.selected)
      ipcRenderer?.removeAllListeners(WORKSPACES.created)
      ipcRenderer?.removeAllListeners(WORKSPACES.updated)
      ipcRenderer?.removeAllListeners(WORKSPACES.removed)
      ipcRenderer?.removeAllListeners(WORKSPACES.duplicated)
      ipcRenderer?.removeAllListeners(WORKSPACES.error)
    }
  }, [ipcRenderer, reload])

  const create = useCallback(
    (name: string) => {
      ipcRenderer?.send(WORKSPACES.create, { name })
    },
    [ipcRenderer]
  )

  const update = useCallback(
    (workspace: WorkspaceType) => {
      ipcRenderer?.send(WORKSPACES.update, workspace)
    },
    [ipcRenderer]
  )

  const select = useCallback(
    (id: Identifier) => {
      ipcRenderer?.send(WORKSPACES.select, { id })
    },
    [ipcRenderer]
  )

  const remove = useCallback(
    (id: Identifier) => {
      ipcRenderer?.send(WORKSPACES.remove, { id })
    },
    [ipcRenderer]
  )

  const duplicate = useCallback(
    (id: Identifier) => {
      ipcRenderer?.send(WORKSPACES.duplicate, { id })
    },
    [ipcRenderer]
  )

  return useMemo(
    () => ({
      workspaces,
      selectedWorkspace,
      create,
      update,
      select,
      reload,
      remove,
      duplicate
    }),
    [workspaces, selectedWorkspace, create, update, select, reload, remove, duplicate]
  )
}
