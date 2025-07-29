import { dialog, ipcMain } from 'electron'
import CollectionImporter from '../lib/CollectionImporter'
import { COLLECTIONS } from '../lib/ipcChannels'
import { workspaces } from '.'
import CollectionExporter from '../lib/CollectionExporter'
import fs from 'fs'

const COLLECTIONS_KEY = 'collections'

ipcMain.on(COLLECTIONS.create, (event, collection: Collection) => {
  const store = workspaces.getStore()
  const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
  collections.push(collection)
  store.set(COLLECTIONS_KEY, collections)
  event.reply(COLLECTIONS.updated, collections)
})

ipcMain.on(COLLECTIONS.update, (event, collection: Collection) => {
  const store = workspaces.getStore()
  const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
  const newCollections = collections.map((c) => (c.id === collection.id ? collection : c))
  store.set(COLLECTIONS_KEY, newCollections)
  event.reply(COLLECTIONS.updated, newCollections)
})

ipcMain.on(COLLECTIONS.updateAll, (event, collections: Collection[]) => {
  const store = workspaces.getStore()
  store.set(COLLECTIONS_KEY, collections)
  event.reply(COLLECTIONS.updated, collections)
})

ipcMain.on(COLLECTIONS.get, (event) => {
  const store = workspaces.getStore()
  event.reply(COLLECTIONS.updated, store.get(COLLECTIONS_KEY, []))
})

ipcMain.on(COLLECTIONS.remove, (event, collectionId: string) => {
  const store = workspaces.getStore()
  const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
  const newCollections = collections.filter((collection) => collection.id !== collectionId)
  store.set(COLLECTIONS_KEY, newCollections)
  event.reply(COLLECTIONS.updated, newCollections)
})

ipcMain.on(COLLECTIONS.import, async (event) => {
  const dialogOptions: Electron.OpenDialogSyncOptions = {
    title: 'Import Collection',
    properties: ['openFile'],
    filters: [
      { name: 'JSON', extensions: ['json'] },
      { name: 'YAML', extensions: ['yaml', 'yml'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }
  dialog.showOpenDialog(dialogOptions).then(async (result) => {
    if (result.canceled) {
      event.reply(COLLECTIONS.importCanceled)
      return
    }
    event.reply(COLLECTIONS.importProgress, 0)
    try {
      const importer = new CollectionImporter(result.filePaths[0])
      for await (const status of importer.import()) {
        event.reply(COLLECTIONS.importProgress, status)
      }
      event.reply(COLLECTIONS.importProgress, 100)
      event.reply(COLLECTIONS.importResult, {
        filePath: result.filePaths[0],
        collection: importer.getCollection()
      })
      const store = workspaces.getStore()
      const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
      collections.push(importer.getCollection())
      store.set(COLLECTIONS_KEY, collections)
      event.reply(COLLECTIONS.updated, store.get(COLLECTIONS_KEY, collections))
    } catch (error) {
      console.error(error)
      let errorMessage = 'Can not import collection'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      event.reply(COLLECTIONS.importFailure, errorMessage)
    }
  })
})

ipcMain.on(COLLECTIONS.export, (event, collectionId: Identifier, format: ImportExportFormat) => {
  const store = workspaces.getStore()
  const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) {
    const message = 'Collection not found. Please select a valid collection to export.'
    event.reply(COLLECTIONS.exportFailure, { collectionId, format, message })
    return
  }

  try {
    const collectionExporter = new CollectionExporter(collection)

    let result = ''

    if (format === 'Postman') {
      result = collectionExporter.exportToPostman()
    } else if (format === 'OpenAPI') {
      result = collectionExporter.exportToOpenAPI()
    }

    if (!result) {
      throw new Error('Export result is empty')
    }

    const dialogOptions: Electron.SaveDialogSyncOptions = {
      title: `Export ${format} Collection`,
      defaultPath: `${collection.name}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    }

    const filePath = dialog.showSaveDialogSync(dialogOptions)
    if (!filePath) {
      return
    }

    fs.writeFileSync(filePath, result, 'utf-8')
  } catch (error) {
    console.error(error)
    let errorMessage = `Can not export collection to ${format}`
    if (error instanceof Error) {
      errorMessage = error.message
    }
    event.reply(COLLECTIONS.exportFailure, { collectionId, format, errorMessage })
    return
  }

  event.reply(COLLECTIONS.exportResult, { collectionId, format })
})
