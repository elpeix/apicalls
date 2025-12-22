import { destroyStore, IStore, IStorerFactory } from './appStore'

type WorkspaceDataType = {
  tabs: unknown
  environments: unknown
  collections: unknown
  cookies: unknown
}

const DEFAULT_WORKSPACE_ID = 'workspace'
const DEFAULT_WORKSPACE_NAME = 'Default Workspace'

export class Workspaces {
  private workspaces: WorkspaceType[]
  private selectedWorkspace: WorkspaceType | null = null

  constructor(private storerFactory: IStorerFactory) {
    this.storerFactory = storerFactory
    this.workspaces = this.#getWorkspaces()
    this.selectedWorkspace = this.getSelected()
  }

  getList(): WorkspaceType[] {
    return this.workspaces
  }

  getSelected(): WorkspaceType {
    if (this.selectedWorkspace) {
      return this.selectedWorkspace
    }
    const selectedWorkspace = this.workspaces.find((w) => w.selected)
    if (selectedWorkspace) {
      this.selectedWorkspace = selectedWorkspace
    } else {
      this.selectedWorkspace = this.select(DEFAULT_WORKSPACE_ID as Identifier)
    }
    return this.selectedWorkspace
  }

  getStore(): IStore {
    const selectedWorkspace = this.getSelected()
    return this.storerFactory.getWorkspaceStore(selectedWorkspace.id.toString())
  }

  create(name: string): WorkspaceType {
    name = name.trim()
    if (!name) {
      throw new Error('Workspace name is required')
    }
    if (this.workspaces.find((w) => w.name === name)) {
      throw new Error('Workspace with this name already exists')
    }

    this.workspaces.forEach((w) => (w.selected = false))

    const id = new Date().getTime() as Identifier
    this.selectedWorkspace = { id, name, selected: true }
    this.workspaces.push(this.selectedWorkspace)

    this.#saveWorkspaces()
    this.#createStore(id)

    return this.selectedWorkspace
  }

  update(argWorkspace: WorkspaceType): WorkspaceType {
    const id = argWorkspace.id
    const name = argWorkspace.name.trim()

    if (!name) {
      throw new Error('Workspace name is required')
    }
    if (this.workspaces.find((w) => w.name === name && w.id !== id)) {
      throw new Error('Workspace with this name already exists')
    }
    const workspace = this.#getWorkspace(id)
    workspace.name = name
    workspace.requestHeaders = argWorkspace.requestHeaders

    this.workspaces = this.workspaces.map((w) => (w.id === id ? workspace : w))
    this.#saveWorkspaces()
    return workspace
  }

  remove(id: Identifier): void {
    const workspaceIndex = this.workspaces.findIndex((w) => w.id === id)
    if (workspaceIndex === -1) {
      throw new Error('Workspace not found')
    }
    if (this.workspaces[workspaceIndex].id === DEFAULT_WORKSPACE_ID) {
      throw new Error('Cannot remove the default workspace')
    }

    if (this.workspaces[workspaceIndex].selected) {
      this.select(DEFAULT_WORKSPACE_ID as Identifier)
    }

    this.workspaces.splice(workspaceIndex, 1)
    this.#saveWorkspaces()

    this.#getAppStore().delete(id.toString())
    this.storerFactory.getWorkspaceStore(id.toString()).clear()
    // Note: In electron-store, delete is not available.
    //       The store file should be removed manually.
    destroyStore(id.toString())
  }

  duplicate(id: Identifier): WorkspaceType {
    const workspace = this.#getWorkspace(id)
    const newId = new Date().getTime() as Identifier
    this.selectedWorkspace = {
      id: newId,
      name: `${workspace.name} (copy)`,
      requestHeaders: workspace.requestHeaders || [],
      selected: true
    }

    this.workspaces.forEach((w) => (w.selected = false))

    this.workspaces.push(this.selectedWorkspace)
    this.#saveWorkspaces()

    const workspaceStorer = this.storerFactory.getWorkspaceStore(id.toString())
    this.#createStore(newId, {
      tabs: workspaceStorer.get('tabs', []),
      environments: workspaceStorer.get('environments', []),
      collections: workspaceStorer.get('collections', []),
      cookies: workspaceStorer.get('cookies', [])
    })
    return this.selectedWorkspace
  }

  select(id: Identifier | undefined): WorkspaceType {
    const workspace = this.#getWorkspace(id)
    this.workspaces = this.workspaces.map((w) => ({
      ...w,
      selected: w.id === workspace.id
    }))
    workspace.selected = true
    this.#saveWorkspaces(this.workspaces)
    this.selectedWorkspace = workspace
    return this.selectedWorkspace
  }

  #createStore(id: Identifier, workspaceData?: WorkspaceDataType): IStore {
    return this.storerFactory.getWorkspaceStore(id.toString(), {
      tabs: workspaceData?.tabs || [],
      environments: workspaceData?.environments || [],
      collections: workspaceData?.collections || [],
      cookies: workspaceData?.cookies || []
    })
  }

  #getWorkspaces = (): WorkspaceType[] => {
    const workspaces = this.#getAppStore().get('workspaces', []) as WorkspaceType[]
    if (!workspaces || workspaces.length === 0) {
      const defaultWorkspace: WorkspaceType = {
        id: DEFAULT_WORKSPACE_ID as Identifier,
        name: DEFAULT_WORKSPACE_NAME,
        selected: true
      }
      this.#getAppStore().set('workspaces', [defaultWorkspace])
      return [defaultWorkspace]
    }
    return workspaces
  }

  #saveWorkspaces = (workspaces?: WorkspaceType[]): void => {
    if (workspaces) {
      this.workspaces = workspaces
    }
    this.#getAppStore().set('workspaces', this.workspaces)
  }

  #getWorkspace = (id: Identifier | undefined): WorkspaceType => {
    this.#validateWorkspaceId(id)
    const workspace = this.workspaces.find((w) => w.id === id)
    if (!workspace) {
      throw new Error('Workspace not found')
    }
    return workspace
  }

  #validateWorkspaceId = (id: Identifier | undefined): void => {
    if (!id) {
      throw new Error('Workspace ID is required')
    }
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new Error('Invalid Workspace ID type')
    }
  }

  #getAppStore = (): IStore => {
    return this.storerFactory.getAppStore()
  }
}
