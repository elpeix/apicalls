import { dialog, ipcMain } from 'electron'
import Store from 'electron-store'
import CollectionImporter from '../lib/CollectionImporter'
import { COLLECTIONS } from '../lib/ipcChannels'

const store = new Store()
const COLLECTIONS_KEY = 'collections'

ipcMain.on(COLLECTIONS.create, (event, collection: Collection) => {
  const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
  collections.push(collection)
  store.set(COLLECTIONS_KEY, collections)
  event.reply(COLLECTIONS.updated, collections)
})

ipcMain.on(COLLECTIONS.update, (event, collection: Collection) => {
  const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
  const newCollections = collections.map((c) => (c.id === collection.id ? collection : c))
  store.set(COLLECTIONS_KEY, newCollections)
  event.reply(COLLECTIONS.updated, newCollections)
})

ipcMain.on(COLLECTIONS.updateAll, (event, collections: Collection[]) => {
  store.set(COLLECTIONS_KEY, collections)
  event.reply(COLLECTIONS.updated, collections)
})

ipcMain.on(COLLECTIONS.get, (event) => {
  event.reply(COLLECTIONS.updated, store.get(COLLECTIONS_KEY, []))
})

ipcMain.on(COLLECTIONS.remove, (event, collectionId: string) => {
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
      { name: 'YAML', extensions: ['yaml', 'yml'] },
      { name: 'JSON', extensions: ['json'] },
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
      const collections = store.get(COLLECTIONS_KEY, []) as Collection[]
      collections.push(importer.getCollection())
      store.set(COLLECTIONS_KEY, collections)
      event.reply(COLLECTIONS.updated, store.get(COLLECTIONS_KEY, collections))
    } catch (error) {
      console.error(error)
      event.reply(COLLECTIONS.importFailure, error)
    }
  })
})
