import { ipcMain, dialog } from 'electron'
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
  IMPORT_COLLECTION_RESULT
} from '../lib/ipcChannels'

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
