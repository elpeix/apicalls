import { ipcMain } from 'electron'
import { WORKSPACES } from '../lib/ipcChannels'
import { workspaces } from '.'

ipcMain.on(WORKSPACES.create, (event, { name }) => {
  try {
    event.reply(WORKSPACES.created, workspaces.create(name))
    event.reply(WORKSPACES.changed)
  } catch (error) {
    event.reply(WORKSPACES.error, {
      message: (error as Error).message
    })
  }
})

ipcMain.on(WORKSPACES.update, (event, { id, name }) => {
  try {
    event.reply(WORKSPACES.updated, workspaces.update(id, name))
  } catch (error) {
    event.reply(WORKSPACES.error, {
      message: (error as Error).message
    })
  }
})

ipcMain.on(WORKSPACES.remove, (event, { id }) => {
  try {
    workspaces.remove(id)
    event.reply(WORKSPACES.removed, { id })
    event.reply(WORKSPACES.changed)
  } catch (error) {
    event.reply(WORKSPACES.error, {
      message: (error as Error).message
    })
  }
})

ipcMain.on(WORKSPACES.duplicate, (event, { id }: { id: Identifier }) => {
  try {
    event.reply(WORKSPACES.duplicated, workspaces.duplicate(id))
    event.reply(WORKSPACES.changed)
  } catch (error) {
    event.reply(WORKSPACES.error, {
      message: (error as Error).message
    })
  }
})

ipcMain.on(WORKSPACES.getList, (event) => {
  event.reply(WORKSPACES.list, workspaces.getList())
})

ipcMain.on(WORKSPACES.getSelected, (event) => {
  event.reply(WORKSPACES.selected, workspaces.getSelected())
})

ipcMain.on(WORKSPACES.select, (event, { id }) => {
  try {
    const selectedWorkspace = workspaces.getSelected()
    const workspace = workspaces.select(id)
    event.reply(WORKSPACES.selected, workspace)
    if (selectedWorkspace.id !== workspace.id) {
      event.reply(WORKSPACES.changed)
    }
  } catch (error) {
    event.reply(WORKSPACES.error, {
      message: (error as Error).message
    })
  }
})
