import { ipcMain } from 'electron'
import { ENVIRONMENTS } from '../lib/ipcChannels'
import { getWorkspaceStore } from '../lib/appStore'

const store = getWorkspaceStore()

const ENVIRONMENTS_KEY = 'environments'

ipcMain.on(ENVIRONMENTS.create, (event, environment: Environment) => {
  const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
  environments.push(environment)
  store.set(ENVIRONMENTS_KEY, environments)
  event.reply(ENVIRONMENTS.updated, environments)
})

ipcMain.on(ENVIRONMENTS.update, (event, environment: Environment) => {
  const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
  const newEnvironments = environments.map((c) => (c.id === environment.id ? environment : c))
  store.set(ENVIRONMENTS_KEY, newEnvironments)
  event.reply(ENVIRONMENTS.updated, newEnvironments)
})

ipcMain.on(ENVIRONMENTS.updateAll, (event, environments: Environment[]) => {
  store.set(ENVIRONMENTS_KEY, environments)
  event.reply(ENVIRONMENTS.updated, environments)
})

ipcMain.on(ENVIRONMENTS.get, (event) => {
  event.reply(ENVIRONMENTS.updated, store.get(ENVIRONMENTS_KEY, []))
})

ipcMain.on(ENVIRONMENTS.remove, (event, envionmentId: string) => {
  const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
  const newEnvironments = environments.filter((collection) => collection.id !== envionmentId)
  store.set(ENVIRONMENTS_KEY, newEnvironments)
  event.reply(ENVIRONMENTS.updated, newEnvironments)
})
