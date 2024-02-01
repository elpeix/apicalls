import { ipcMain } from 'electron'
import Store from 'electron-store'
import {
  CREATE_ENVIRONMENT,
  ENVIRONMENTS_UPDATED,
  GET_ENVIRONMENTS,
  REMOVE_ENVIRONMENT,
  UPDATE_ENVIRONMENT
} from '../lib/ipcChannels'

const store = new Store()

const ENVIRONMENTS = 'environments'

ipcMain.on(CREATE_ENVIRONMENT, (event, environment: Environment) => {
  const environments = store.get(ENVIRONMENTS, []) as Environment[]
  environments.push(environment)
  store.set(ENVIRONMENTS, environments)
  event.reply(ENVIRONMENTS_UPDATED, environments)
})

ipcMain.on(UPDATE_ENVIRONMENT, (event, environment: Environment) => {
  const environments = store.get(ENVIRONMENTS, []) as Environment[]
  const newEnvironments = environments.map((c) => (c.id === environment.id ? environment : c))
  store.set(ENVIRONMENTS, newEnvironments)
  event.reply(ENVIRONMENTS_UPDATED, newEnvironments)
})

ipcMain.on(GET_ENVIRONMENTS, (event) => {
  event.reply(ENVIRONMENTS_UPDATED, store.get(ENVIRONMENTS, []))
})

ipcMain.on(REMOVE_ENVIRONMENT, (event, envionmentId: string) => {
  const environments = store.get(ENVIRONMENTS, []) as Environment[]
  const newEnvironments = environments.filter((collection) => collection.id !== envionmentId)
  store.set(ENVIRONMENTS, newEnvironments)
  event.reply(ENVIRONMENTS_UPDATED, newEnvironments)
})
