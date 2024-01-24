import { ipcMain, dialog } from 'electron'
import Store from 'electron-store'
import CollectionImporter from '../lib/CollectionImporter'
import { restCall } from '../../src/lib/restCaller'
import {
  CALL_API,
  CALL_API_FAILURE,
  CALL_API_RESPONSE,
  IMPORT_COLLECTION,
  IMPORT_COLLECTION_CANCELED,
  IMPORT_COLLECTION_FAILURE,
  IMPORT_COLLECTION_PROGRESS,
  IMPORT_COLLECTION_RESULT,
  GET_COLLECTIONS,
  COLLECTIONS_UPDATED,
  REMOVE_COLLECTION
} from '../lib/ipcChannels'

const store = new Store()

ipcMain.on('get-settings', (event) => {
  event.reply('settings', store.get('settings', { theme: 'system', proxy: '' }))
})

ipcMain.on('save-settings', (_, settings) => store.set('settings', settings))

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

ipcMain.on(CALL_API, async (event, callRequest: CallRequest) => {
  try {
    const response = await restCall(callRequest)
    event.reply(CALL_API_RESPONSE, response)
  } catch (error) {
    event.reply(CALL_API_FAILURE, error)
  }
})
