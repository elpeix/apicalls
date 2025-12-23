import { dialog, ipcMain } from 'electron'
import { ENVIRONMENTS } from '../lib/ipcChannels'
import { workspaces } from '.'
import fs from 'fs'
import { EnvironmentImporter } from '../lib/EnvironmentImporter'

const ENVIRONMENTS_KEY = 'environments'

ipcMain.on(ENVIRONMENTS.create, (event, environment: Environment) => {
  const store = workspaces.getStore()
  const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
  environments.push(environment)
  store.set(ENVIRONMENTS_KEY, environments)
  event.reply(ENVIRONMENTS.updated, environments)
})

ipcMain.on(ENVIRONMENTS.update, (event, environment: Environment) => {
  const store = workspaces.getStore()
  const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
  const newEnvironments = environments.map((c) => (c.id === environment.id ? environment : c))
  store.set(ENVIRONMENTS_KEY, newEnvironments)
  event.reply(ENVIRONMENTS.updated, newEnvironments)
})

ipcMain.on(ENVIRONMENTS.updateAll, (event, environments: Environment[]) => {
  const store = workspaces.getStore()
  store.set(ENVIRONMENTS_KEY, environments)
  event.reply(ENVIRONMENTS.updated, environments)
})

ipcMain.on(ENVIRONMENTS.get, (event) => {
  const store = workspaces.getStore()
  event.reply(ENVIRONMENTS.updated, store.get(ENVIRONMENTS_KEY, []))
})

ipcMain.on(ENVIRONMENTS.remove, (event, envionmentId: string) => {
  const store = workspaces.getStore()
  const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
  const newEnvironments = environments.filter((collection) => collection.id !== envionmentId)
  store.set(ENVIRONMENTS_KEY, newEnvironments)
  event.reply(ENVIRONMENTS.updated, newEnvironments)
})

ipcMain.on(ENVIRONMENTS.import, async (event) => {
  const dialogOptions: Electron.OpenDialogSyncOptions = {
    title: 'Import Environment',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  }
  dialog.showOpenDialog(dialogOptions).then(async (result) => {
    if (result.canceled) {
      event.reply(ENVIRONMENTS.importCanceled)
      return
    }
    event.reply(ENVIRONMENTS.importProgress, 0)
    try {
      const environmentImporter = new EnvironmentImporter(result.filePaths[0])
      const environment = environmentImporter.import()

      event.reply(ENVIRONMENTS.importProgress, 100)
      event.reply(ENVIRONMENTS.importResult, {
        filePath: result.filePaths[0],
        environment: environment
      })
      const store = workspaces.getStore()
      const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
      environments.push(environment)
      store.set(ENVIRONMENTS_KEY, environments)
      event.reply(ENVIRONMENTS.updated, store.get(ENVIRONMENTS_KEY, environments))
    } catch (error) {
      console.error(error)
      let errorMessage = 'Can not import environment'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      event.reply(ENVIRONMENTS.importFailure, errorMessage)
    }
  })
})

ipcMain.on(ENVIRONMENTS.export, (event, environmentId: Identifier) => {
  const store = workspaces.getStore()
  const environments = store.get(ENVIRONMENTS_KEY, []) as Environment[]
  const environment = environments.find((e) => e.id === environmentId)
  if (!environment) {
    const message = 'Environment not found. Please select a valid environment to export.'
    event.reply(ENVIRONMENTS.exportFailure, { environmentId, message })
    return
  }

  try {
    const dialogOptions: Electron.SaveDialogSyncOptions = {
      title: 'Export environment',
      defaultPath: `${environment.name}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    }

    const filePath = dialog.showSaveDialogSync(dialogOptions)
    if (!filePath) {
      return
    }

    const result = JSON.stringify(environment, (k, v) => {
      if (k === 'id' || k === 'active') {
        return undefined
      }
      return v
    })

    fs.writeFileSync(filePath, result, 'utf-8')

    event.reply(ENVIRONMENTS.exportResult, { environmentId })
  } catch (error) {
    let errorMessage = 'Can not export environment'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    event.reply(ENVIRONMENTS.exportFailure, { environmentId, errorMessage })
  }
})
