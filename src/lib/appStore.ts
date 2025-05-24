import Store from 'electron-store'

export interface IStore {
  get(key: string, defaultValue: unknown): unknown
  set(key: string, value: unknown): void
  delete(key: string): void
  clear(): void
}

export interface IStorerFactory {
  getAppStore(): IStore
  getSettingsStore(): IStore
  getWorkspaceStore(name: string, data?: Record<string, unknown>): IStore
}

class BaseStore implements IStore {
  private store: Store

  constructor(name: string, data?: Record<string, unknown>) {
    this.store = new Store({ name })
    if (data) {
      this.store.set(data)
    }
  }

  get(key: string, defaultValue: unknown): unknown {
    return this.store.get(key, defaultValue)
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

export const StorerFactory: IStorerFactory = {
  getAppStore: () => new BaseStore('app'),
  getSettingsStore: () => new BaseStore('settings'),
  getWorkspaceStore: (name: string, data?: Record<string, unknown>) => new BaseStore(name, data)
}
