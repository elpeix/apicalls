import { useEffect, useState } from 'react'
import { COLLECTIONS, COOKIES, ENVIRONMENTS, TABS, WORKSPACES } from '../../../lib/ipcChannels'

export function useWorkspaces(): WorkspacesHookType {
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceType | null>(null)
  const ipcRenderer = window.electron?.ipcRenderer

  const reload = () => {
    ipcRenderer?.send(WORKSPACES.getList)
    ipcRenderer?.send(WORKSPACES.getSelected)
  }

  useEffect(() => {
    reload()

    ipcRenderer?.on(WORKSPACES.list, (_: unknown, ws: WorkspaceType[]) => {
      setWorkspaces(ws)
    })

    ipcRenderer?.on(WORKSPACES.selected, (_: unknown, ws: WorkspaceType) => {
      if (!ws) {
        console.warn('No workspace selected')
        return
      }
      if (ws.id !== selectedWorkspace?.id) {
        setSelectedWorkspace(ws)

        setWorkspaces((prevWorkspaces) =>
          prevWorkspaces.map((w) => ({
            ...w,
            selected: w.id === ws.id
          }))
        )

        ipcRenderer?.send(WORKSPACES.getList)
        ipcRenderer?.send(ENVIRONMENTS.get)
        ipcRenderer?.send(COLLECTIONS.get)
        ipcRenderer?.send(TABS.load)
        ipcRenderer?.send(COOKIES.get)
      }
    })

    ipcRenderer?.on(WORKSPACES.created, (_: unknown, __: WorkspaceType) => {
      reload()
    })

    ipcRenderer?.on(WORKSPACES.updated, (_: unknown, ___: WorkspaceType) => {
      reload()
    })

    ipcRenderer?.on(WORKSPACES.removed, (_: unknown, __: { id: Identifier }) => {
      reload()
    })

    ipcRenderer?.on(WORKSPACES.duplicated, (_: unknown, __: WorkspaceType) => {
      reload()
    })

    return () => {
      ipcRenderer?.removeAllListeners(WORKSPACES.list)
      ipcRenderer?.removeAllListeners(WORKSPACES.selected)
      ipcRenderer?.removeAllListeners(WORKSPACES.created)
      ipcRenderer?.removeAllListeners(WORKSPACES.updated)
      ipcRenderer?.removeAllListeners(WORKSPACES.removed)
      ipcRenderer?.removeAllListeners(WORKSPACES.duplicated)
      ipcRenderer?.removeAllListeners(WORKSPACES.error)
    }
  }, [])

  const create = (name: string) => {
    ipcRenderer?.send(WORKSPACES.create, { name })
  }

  const update = (workspace: WorkspaceType) => {
    ipcRenderer?.send(WORKSPACES.update, workspace)
  }

  const select = (id: Identifier) => {
    ipcRenderer?.send(WORKSPACES.select, { id })
  }

  const remove = (id: Identifier) => {
    ipcRenderer?.send(WORKSPACES.remove, { id })
  }

  const duplicate = (id: Identifier) => {
    ipcRenderer?.send(WORKSPACES.duplicate, { id })
  }

  return {
    workspaces,
    selectedWorkspace,
    create,
    update,
    select,
    reload,
    remove,
    duplicate
  }
}
