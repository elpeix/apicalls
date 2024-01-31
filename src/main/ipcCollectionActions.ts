import { dialog, ipcMain } from 'electron'
import Store from 'electron-store'
import CollectionImporter from '../lib/CollectionImporter'
import {
  COLLECTIONS_UPDATED,
  CREATE_COLLECTION,
  GET_COLLECTIONS,
  IMPORT_COLLECTION,
  IMPORT_COLLECTION_CANCELED,
  IMPORT_COLLECTION_FAILURE,
  IMPORT_COLLECTION_PROGRESS,
  IMPORT_COLLECTION_RESULT,
  REMOVE_COLLECTION,
  UPDATE_COLLECTION
} from '../lib/ipcChannels'

const store = new Store()

ipcMain.on(CREATE_COLLECTION, (event, collection: Collection) => {
  const collections = store.get('collections', []) as Collection[]
  collections.push(collection)
  store.set('collections', collections)
  event.reply(COLLECTIONS_UPDATED, collections)
})

ipcMain.on(UPDATE_COLLECTION, (event, collection: Collection) => {
  const collections = store.get('collections', []) as Collection[]
  const newCollections = collections.map((c) => (c.id === collection.id ? collection : c))
  store.set('collections', newCollections)
  event.reply(COLLECTIONS_UPDATED, newCollections)
})

ipcMain.on(GET_COLLECTIONS, (event) => {
  event.reply(COLLECTIONS_UPDATED, store.get('collections', []))
})

ipcMain.on(REMOVE_COLLECTION, (event, collectionId: string) => {
  const collections = store.get('collections', []) as Collection[]
  const newCollections = collections.filter((collection) => collection.id !== collectionId)
  store.set('collections', newCollections)
  event.reply(COLLECTIONS_UPDATED, newCollections)
})

ipcMain.on(IMPORT_COLLECTION, async (event) => {
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
      event.reply(IMPORT_COLLECTION_CANCELED)
      return
    }
    event.reply(IMPORT_COLLECTION_PROGRESS, 0)
    try {
      const importer = new CollectionImporter(result.filePaths[0])
      for await (const status of importer.import()) {
        event.reply(IMPORT_COLLECTION_PROGRESS, status)
      }
      event.reply(IMPORT_COLLECTION_PROGRESS, 100)
      event.reply(IMPORT_COLLECTION_RESULT, {
        filePath: result.filePaths[0],
        collection: importer.getCollection()
      })
      const collections = store.get('collections', []) as Collection[]
      collections.push(importer.getCollection())
      store.set('collections', collections)
      event.reply(COLLECTIONS_UPDATED, store.get('collections', collections))
    } catch (error) {
      console.error(error)
      event.reply(IMPORT_COLLECTION_FAILURE, error)
    }
  })
})
